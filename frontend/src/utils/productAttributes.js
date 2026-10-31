export const DEFAULT_ADDITIONAL_DETAILS = [
  'Color',
  'Occasion',
  'Type',
  'Blouse Fabric',
  'Border',
  'Ornamentation',
  'Pattern',
  'Print or Pattern Type',
  'Blouse Pattern',
  'Pallu Details',
  'Blouse Color',
  'Loom Type',
  'Border Width',
  'Brand',
  'Generic Name',
  'Country of Origin',
];

export const normalizeAdditionalDetails = (attributes = []) => {
  const validAttributes = Array.isArray(attributes)
    ? attributes.filter((attribute) => attribute && typeof attribute === 'object' && attribute.label)
    : [];
  const defaultLabels = new Set(DEFAULT_ADDITIONAL_DETAILS.map((label) => label.toLowerCase()));
  const savedByLabel = new Map(
    validAttributes.map((attribute) => [
      String(attribute.label).trim().toLowerCase(),
      { label: String(attribute.label).trim(), value: String(attribute.value || '') },
    ])
  );
  const defaultDetails = DEFAULT_ADDITIONAL_DETAILS.map((label) => (
    savedByLabel.get(label.toLowerCase()) || { label, value: '' }
  ));
  const customDetails = validAttributes
    .filter((attribute) => !defaultLabels.has(String(attribute.label).trim().toLowerCase()))
    .map((attribute) => ({
      label: String(attribute.label).trim(),
      value: String(attribute.value || ''),
    }));

  return [...defaultDetails, ...customDetails];
};
