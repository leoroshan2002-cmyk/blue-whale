import { useEffect, useState } from "react";
import CampaignForm from "../Admin/components/CampaignForm";
import PromoCardForm from "../Admin/components/PromoCardForm";
import { getCampaign, saveCampaign } from "../services/api";

const createEmptyCampaign = (category = "women") => ({

  category,
  slider: Array.from({ length: 2 }, (_, index) => ({
    id: index + 1,
    image: "",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    button: "",
    link: `/category/${category}`,
  })),
  promoCards: Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    image: "",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    button: "",
    link: `/category/${category}`,
  })),
  bottomPromoCards: Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    image: "",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    button: "",
    link: `/category/${category}`,
  })),
});

export default function CampaignManagement() {
  const [campaign, setCampaign] = useState(() => createEmptyCampaign("women"));
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCampaign = async () => {
      const existingCampaign = await getCampaign(campaign.category);
      if (isMounted) {
        setCampaign(existingCampaign);
      }
    };

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [campaign.category]);

  const updateSlide = (index, field, value) => {
    setCampaign((prev) => {
      const slider = [...prev.slider];
      slider[index] = {
        ...slider[index],
        [field]: value,
      };

      return {
        ...prev,
        slider,
      };
    });
  };

  const updateCard = (index, field, value) => {
    setCampaign((prev) => {
      const promoCards = [...prev.promoCards];
      promoCards[index] = {
        ...promoCards[index],
        [field]: value,
      };

      return {
        ...prev,
        promoCards,
      };
    });
  };

  const updateBottomCard = (index, field, value) => {
    setCampaign((prev) => {
      const bottomPromoCards = [...prev.bottomPromoCards];
      bottomPromoCards[index] = {
        ...bottomPromoCards[index],
        [field]: value,
      };

      return {
        ...prev,
        bottomPromoCards,
      };
    });
  };

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;
    setStatusMessage("");
    setCampaign((prev) => ({
      ...createEmptyCampaign(nextCategory),
      ...prev,
      category: nextCategory,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await saveCampaign(campaign);
      setStatusMessage(response.message || "Campaign saved successfully");
    } catch (error) {
      setStatusMessage(error.message || "Unable to save campaign");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Campaign Management</h1>


Screen 1
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <label className="block text-sm font-semibold mb-2">Select category</label>
          <select
            className="border rounded p-3 min-w-[220px]"
            value={campaign.category}
            onChange={handleCategoryChange}
          >
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kids">Kids</option>
            <option value="unisex">Unisex</option>
            <option value="new-arrivals">New Arrivals</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-black text-white px-8 py-3 rounded-lg disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Campaign"}
        </button>
      </div>

      {statusMessage && (
        <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Slider Images</h2>

      <div className="grid lg:grid-cols-3 gap-6 mb-14">
        {campaign.slider.map((slide, index) => (
          <CampaignForm
            key={`${campaign.category}-slide-${index}`}
            slide={slide}
            index={index}
            updateSlide={updateSlide}
          />
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">Promo Cards</h2>

      <div className="grid lg:grid-cols-3 gap-6 mb-14">
        {campaign.promoCards.map((card, index) => (
          <PromoCardForm
            key={`${campaign.category}-card-${index}`}
            card={card}
            index={index}
            updateCard={updateCard}
          />
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">Bottom Promo Cards</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {campaign.bottomPromoCards.map((card, index) => (
          <PromoCardForm
            key={`${campaign.category}-bottom-card-${index}`}
            card={card}
            index={index}
            updateCard={updateBottomCard}
          />
        ))}
      </div>
    </div>
  );
}