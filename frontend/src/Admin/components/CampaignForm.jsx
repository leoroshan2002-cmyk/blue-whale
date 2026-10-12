import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../../utils/productImages";

const CampaignForm = ({ slide, index, updateSlide }) => {
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <h3 className="font-bold mb-4">Slide {index + 1}</h3>
      <input
        type="file"
        accept="image/*"
        className="w-full text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            updateSlide(index, "image", URL.createObjectURL(file));
            updateSlide(index, "imageFile", file);
          }
        }}
      />
    

      {slide.image && (
        <img
          src={slide.image?.startsWith("blob:") ? slide.image : getSafeImageUrl(slide.image, DEFAULT_IMAGE_FALLBACK)}
          alt=""
          className="mt-3 h-48 w-full rounded object-cover"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
          }}
        />
      )}

      {/* <input
        className="border rounded p-2 w-full mt-4"
        placeholder="Title"
        value={slide.title || ""}
        onChange={(event) => updateSlide(index, "title", event.target.value)}
      />

      <input
        className="border rounded p-2 w-full mt-3"
        placeholder="Subtitle"
        value={slide.subtitle || ""}
        onChange={(event) => updateSlide(index, "subtitle", event.target.value)}
      /> */}

      {/* <textarea
        className="border rounded p-2 w-full mt-3 min-h-[88px]"
        placeholder="Description"
        value={slide.description || ""}
        onChange={(event) => updateSlide(index, "description", event.target.value)}
      />

      <input
        className="border rounded p-2 w-full mt-3"
        placeholder="Button Text"
        value={slide.buttonText || ""}
        onChange={(event) => updateSlide(index, "buttonText", event.target.value)}
      />

      <input
        className="border rounded p-2 w-full mt-3"
        placeholder="Link"
        value={slide.link || ""}
        onChange={(event) => updateSlide(index, "link", event.target.value)}
      /> */}
    </div>
  );
};

export default CampaignForm;