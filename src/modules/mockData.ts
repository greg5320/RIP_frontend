import image from "../assets/map_not_found.png"

export const mockMaps = [
  {
    id: 1,
    title: "New Antioch",
    description: "New Antioch хорошая карта",
    status: "active",
    image_url: image,
    players: "До 4",
    tileset: "Пустошь",
    overview: "New Antioch имеет очень удобные возвышенности для обороны.",
  },
  {
    id: 2,
    title: "Lost Temple",
    description: "Lost Temple отличная карта",
    status: "inactive",
    image_url: image,
    players: "До 6",
    tileset: "Лес",
    overview: "Lost Temple обычно входит в список нежелаемых карт для игры за зергов из-за очень большого размера карты.",
  },
];
