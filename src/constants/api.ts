export const API_BASE_URLS = {
  RXNORM: 'https://rxnav.nlm.nih.gov/REST',
  OPENFDA: 'https://api.fda.gov',
  DAILYMED: 'https://dailymed.nlm.nih.gov/dailymed/services/v2',
};

export const RXNORM_API = {
  DRUGS: `${API_BASE_URLS.RXNORM}/drugs.json`,
  PROPERTIES: (rxcui: string) => `${API_BASE_URLS.RXNORM}/rxcui/${rxcui}/properties.json`,
  RELATED: (rxcui: string, tty: string) => `${API_BASE_URLS.RXNORM}/rxcui/${rxcui}/related.json?tty=${tty}`,
};

export const OPENFDA_API = {
  DRUG_LABEL: (brandName: string) => `${API_BASE_URLS.OPENFDA}/drug/label.json?search=openfda.brand_name:"${brandName}"`,
  NDC: (ndc: string) => `${API_BASE_URLS.OPENFDA}/drug/ndc.json?search=product_ndc:"${ndc}"`,
};

export const DAILYMED_API = {
  SPLS: (name: string) => `${API_BASE_URLS.DAILYMED}/spls.json?drug_name=${name}`,
  MEDIA: (setid: string) => `${API_BASE_URLS.DAILYMED}/spls/${setid}/media.json`,
};
