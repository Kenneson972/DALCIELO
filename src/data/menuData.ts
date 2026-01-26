export const menuData = {
  bases: [
    { id: 1, name: "Tomate", price: 0 },
    { id: 2, name: "Crème", price: 0 },
    { id: 3, name: "Verte", price: 0 },
  ],
  
  sauces: [
    { id: 1, name: "Ketchup", price: 0 },
    { id: 2, name: "Barbecue", price: 0 },
    { id: 3, name: "Burger", price: 0 },
    { id: 4, name: "Miel", price: 0 },
    { id: 5, name: "Pesto (maison)", price: 0 },
  ],

  pizzas: [
    // --- CLASSICS (Image 4) ---
    { 
      id: 101, 
      name: "Margherita", 
      price: 11,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Basilic", "Olive"],
    },
    { 
      id: 102, 
      name: "Jambon Fromage", 
      price: 13,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Jambon fumé", "Olive"],
    },
    { 
      id: 103, 
      name: "Calzone O/F", 
      price: 15,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Jambon fumé", "Oeuf", "Olive"],
    },
    { 
      id: 104, 
      name: "Hawaienne", 
      price: 15,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Jambon fumé", "Ananas", "Olive"],
    },
    { 
      id: 105, 
      name: "Reine", 
      price: 16,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Jambon fumé", "Champignon frais de Paris", "Olive"],
    },
    { 
      id: 106, 
      name: "Chorizo", 
      price: 14,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Chorizo", "Oignon rouge", "Olive"],
    },
    { 
      id: 107, 
      name: "Orientale", 
      price: 16,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Merguez", "Poivron", "Oeuf", "Olive"],
    },
    { 
      id: 108, 
      name: "Savoyarde", 
      price: 16,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Bacon fumé", "Pomme de terre", "Oignon rouge", "Olive"],
    },
    { 
      id: 109, 
      name: "Carbonara", 
      price: 16,
      category: "Classique",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Bacon fumé", "Oeuf", "Parmesan", "Olive"],
    },

    // --- SIGNATURES / PIZZA DU CHEF (Image 2 & 3) ---
    { 
      id: 201, 
      name: "Crispy", 
      price: 15,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Poulet cuisiné", "Oignon frit", "Olive", "Après cuisson : sauce au choix"],
      popular: true
    },
    { 
      id: 202, 
      name: "Colombo", 
      price: 16,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Poulet cuisiné", "Oignon rouge", "Poivron", "Après cuisson : sauce au choix"],
    },
    { 
      id: 203, 
      name: "Saucisse Fumée", 
      price: 16,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Saucisse fumée", "Oignon rouge", "Olive", "Après cuisson : sauce au choix"],
    },
    { 
      id: 204, 
      name: "Bouchère", 
      price: 17,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Boeuf cuisiné", "Oignon rouge", "Olive", "Après cuisson : sauce au choix"],
    },
    { 
      id: 205, 
      name: "Burger", 
      price: 18,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Boeuf cuisiné", "Bacon fumé", "Oignon frit", "Olive", "Après cuisson : sauce au choix"],
    },
    { 
      id: 206, 
      name: "Suprême", 
      price: 20,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "3 viandes au choix (Boeuf, Bacon, Chorizo, Jambon, Merguez, Poulet cuisiné, Saucisse)", "Après cuisson : sauce au choix"],
      premium: true
    },
    { 
      id: 207, 
      name: "Duchesse", 
      price: 20,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Olive", "Après cuisson : Jambon cru, Roquette, Tomate cerise, Parmesan, Sauce"],
      premium: true
    },
    { 
      id: 208, 
      name: "Bergère", 
      price: 15,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Soignon chèvre", "Olive", "Après cuisson : sauce au choix"],
    },
    { 
      id: 209, 
      name: "4 Fromages", 
      price: 16,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental (obligatoire)", "Au choix : Bleu, Roquefort, Mimolette, Parmesan ou Gouda", "Olive"],
      vegetarian: true
    },
    { 
      id: 210, 
      name: "Végétarienne", 
      price: 15,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Champignon frais de Paris", "Poivron", "Oignon rouge", "Après cuisson : sauce au choix"],
      vegetarian: true
    },
    { 
      id: 211, 
      name: "Véggie", 
      price: 16,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Olive", "Après cuisson : Roquette, Tomate cerise, Parmesan, Sauce"],
      vegetarian: true
    },
    { 
      id: 212, 
      name: "Anchois", 
      price: 13,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Anchois", "Olive"],
    },
    { 
      id: 213, 
      name: "Thon", 
      price: 16,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Thon cuisiné", "Oignon rouge", "Olive", "Après cuisson : sauce au choix"],
    },
    { 
      id: 214, 
      name: "Crevettes", 
      price: 20,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Oignon rouge", "Crevette", "Olive", "Après cuisson : sauce au choix"],
      premium: true
    },
    { 
      id: 215, 
      name: "Saumon", 
      price: 21,
      category: "Signature",
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "Oignon rouge", "Olive", "Après cuisson : Saumon fumé, Roquette, Parmesan, Sauce"],
      premium: true,
      popular: true
    },
  ],

  friands: [
    {
      id: 301,
      name: "Carnivore",
      price: 8,
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "1 viande au choix (Boeuf, Chorizo, Jambon, Merguez, Poulet, Saucisse)"],
    },
    {
      id: 302,
      name: "Végétarien",
      price: 8,
      ingredients: ["Base au choix", "Mozzarella", "Emmental", "2 condiments au choix (Bleu, Chèvre, Champignon de Paris, Oignon rouge, Oignon frit, Poivron)"],
    },
    {
      id: 303,
      name: "Super carnivore",
      price: 10,
      ingredients: ["Base au choix", "Fromage", "2 viandes au choix (Boeuf, Chorizo, Jambon, Merguez, Poulet, Saucisse)"],
    },
  ],

  drinks: [
    { id: 401, name: "Didier (50cl)", price: 2.5 },
    { id: 402, name: "Didier Citron (50cl)", price: 2.5 },
    { id: 403, name: "Chanflor (50cl)", price: 2.5 },
    { id: 404, name: "Royal Soda (50cl)", price: 2.5 },
    { id: 405, name: "Coca Cola (50cl)", price: 2.5 },
    { id: 406, name: "Ordinaire (50cl)", price: 2.5 },
    { id: 407, name: "Orangina (50cl)", price: 2.5 },
    { id: 408, name: "Mont Pelé (50cl)", price: 3.0 },
  ],

  supplements: [
    { id: 501, name: "Fromages (Emmental, Mozzarella, Chèvre, Bleu, Parmesan)", price: 2 },
    { id: 502, name: "Salades (Roquette, Mâche)", price: 2 },
    { id: 503, name: "Condiments (Ananas, Champignon frais, Oeuf, Oignon rouge, Oignon frit, Olive, Poivron, Pomme de terre, Tomate cerise)", price: 2 },
    { id: 504, name: "Viandes (Boeuf cuisiné, Bacon, Chorizo, Jambon fumé, Merguez, Poulet cuisiné, Saucisse fumée)", price: 3 },
    { id: 505, name: "Produits de la mer (Crevette, Saumon fumé)", price: 4 },
  ]
};

export const contactInfo = {
  name: "Pizza dal Cielo",
  owner: "Guylian Grangenois",
  address: {
    street: "Quartier Bellevue",
    city: "Fort-de-France",
    state: "Martinique",
    postalCode: "97200",
  },
  phone: "+596 696 88 72 70",
  whatsapp: "+596696887270",
  email: "pizzadalcielo@gmail.com",
  socials: {
    instagram: "https://www.instagram.com/pizza_dal_cielo/",
    facebook: "https://www.facebook.com/p/Pizza-dal-Cielo-61561145462850/",
  },
  hours: [
    { day: "Lundi", hours: "Fermé" },
    { day: "Mardi", hours: "18:00 - 22:00" },
    { day: "Mercredi", hours: "18:00 - 22:00" },
    { day: "Jeudi", hours: "18:00 - 22:00" },
    { day: "Vendredi", hours: "18:00 - 22:00" },
    { day: "Samedi", hours: "18:00 - 22:00" },
    { day: "Dimanche", hours: "Fermé" },
  ]
};
