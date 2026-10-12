import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../../utils/productImages";

const PromoCardForm = ({ card, index, updateCard }) => {
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <h3 className="font-bold mb-4">Promo Card {index + 1}</h3>

      <input
        type="file"
        accept="image/*"
        className="w-full text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            updateCard(index, "image", URL.createObjectURL(file));
            updateCard(index, "imageFile", file);
          }
        }}
      />

      {card.image && (
        <img
          src={card.image?.startsWith("blob:") ? card.image : getSafeImageUrl(card.image, DEFAULT_IMAGE_FALLBACK)}
          alt=""
          className="mt-3 h-40 w-full object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
          }}
        />
      )}

      {/* <input
        className="border rounded p-2 w-full mt-4"
        placeholder="Title"
        value={card.title || ""}
        onChange={(event) => updateCard(index, "title", event.target.value)}
      />

      <input
        className="border rounded p-2 w-full mt-3"
        placeholder="Subtitle"
        value={card.subtitle || ""}
        onChange={(event) => updateCard(index, "subtitle", event.target.value)}
      />

      <textarea
        className="border rounded p-2 w-full mt-3 min-h-[88px]"
        placeholder="Description"
        value={card.description || ""}
        onChange={(event) => updateCard(index, "description", event.target.value)}
      /> */}

      {/* <input
        className="border rounded p-2 w-full mt-3"
        placeholder="Button Text"
        value={card.buttonText || ""}
        onChange={(event) => updateCard(index, "buttonText", event.target.value)}
      />

      <input
        className="border rounded p-2 w-full mt-3"
        placeholder="Link"
        value={card.link || ""}
        onChange={(event) => updateCard(index, "link", event.target.value)}
      />*/}
    </div> 
  );
};

export default PromoCardForm;