export const catalogProducts = [
  { id: 'helldivers-2', region: 'GLOBAL', platform: 'PC', title: 'Helldivers 2 - Super Citizen Edition', price: 1499, priceLabel: 'P1,499.00', isTopUp: false },
  { id: 'psn-gift-card', region: 'SEA', platform: 'PLAYSTATION', title: 'PSN Gift Card P1,000 (Philippines)', price: 910, priceLabel: 'P910.00', isTopUp: false },
  { id: 'xbox-game-pass', region: 'GLOBAL', platform: 'XBOX / PC', title: 'Xbox Game Pass Ultimate - 3 Months', price: 1250, priceLabel: 'P1,250.00', isTopUp: false },
  { id: 'mobile-legends', region: 'ASIA', platform: 'MOBILE', title: 'Mobile Legends: Bang Bang 1000 Diamonds', price: 850, priceLabel: 'P850.00', isTopUp: true },
  { id: 'cyberpunk-2077', region: 'GLOBAL', platform: 'PC', title: 'Cyberpunk 2077: Phantom Liberty', price: 1899, priceLabel: 'P1,899.00', isTopUp: false },
  { id: 'apple-gift-card', region: 'US', platform: 'APPLE', title: 'Apple Gift Card $25 (US Region)', price: 1450, priceLabel: 'P1,450.00', isTopUp: false },
  { id: 'animal-crossing', region: 'GLOBAL', platform: 'NINTENDO', title: 'Animal Crossing: New Horizons', price: 2120, priceLabel: 'P2,120.00', isTopUp: false },
  { id: 'genshin-welkin', region: 'ASIA', platform: 'MOBILE', title: 'Genshin Impact - Blessing of the Welkin Moon', price: 290, priceLabel: 'P290.00', isTopUp: true },
] as const;

export type CatalogProduct = (typeof catalogProducts)[number];
