import type { Translations } from './en';

export const fr: Translations = {
  nav: {
    home: 'Accueil',
    about: 'À propos',
    reviews: 'Avis',
    contact: 'Contact',
    faq: 'FAQ',
    orderNow: 'Commander',
    signIn: 'Connexion',
  },
  footer: {
    tagline: 'Desserts premium préparés avec discipline, précision et passion.',
    quickLinks: 'Liens rapides',
    support: 'Support',
    getInTouch: 'Nous contacter',
    links: {
      about: 'À propos',
      reviews: 'Avis',
      order: 'Commander',
      faq: 'FAQ',
      contact: 'Contact',
      privacy: 'Politique de confidentialité',
      terms: "Conditions d'utilisation",
    },
    location: 'Montréal & Laval, Québec',
    available: 'Disponible pour les commandes',
    copyright: (year: number) => `© ${year} MojoDojo. Tous droits réservés. Préparé avec discipline.`,
  },
  home: {
    hero: {
      title: 'Desserts Premium,',
      subtitle: 'Préparés avec Discipline',
      description:
        'Découvrez des desserts et plateaux faits à la main avec précision, des ingrédients premium et un engagement sans faille envers la qualité. Livraison Montréal & Laval.',
      cta: 'Commander',
      ctaSecondary: 'En savoir plus',
    },
    why: {
      title: 'Pourquoi',
      titleAccent: 'MojoDojo',
      subtitle: 'Desserts préparés avec discipline, précision et soin',
      cards: [
        {
          title: 'Qualité Premium',
          description:
            "Seuls les meilleurs ingrédients entrent dans nos desserts. Aucun compromis, aucun raccourci.",
        },
        {
          title: 'Fraîchement Préparé',
          description:
            'Chaque commande est préparée fraîche, garantissant un goût et une qualité maximale à chaque bouchée.',
        },
        {
          title: 'Préparé avec Soin',
          description:
            "Notre équipe apporte précision et passion à chaque dessert, traitant chaque commande comme un chef-d'œuvre.",
        },
      ],
    },
    howItWorks: {
      title: 'Comment',
      titleAccent: 'Commander',
      subtitle: 'Simple, rapide et fiable',
      steps: [
        { step: '01', title: 'Parcourez le menu', description: 'Explorez notre sélection de desserts et plateaux premium' },
        { step: '02', title: 'Passez commande', description: 'Choisissez vos articles et fournissez les détails de livraison' },
        { step: '03', title: 'Nous préparons', description: 'Notre équipe prépare votre commande fraîche à la perfection' },
        { step: '04', title: 'Dégustez', description: 'Cueillette ou livraison — vivez une expérience de dessert exceptionnelle' },
      ],
      cta: 'Commencer votre commande',
    },
  },
  about: {
    story: {
      title: 'Notre',
      titleAccent: 'Histoire',
      p1: "MojoDojo est né d'une conviction simple : les desserts doivent être extraordinaires, pas ordinaires. Ce qui a commencé comme un projet passion s'est transformé en un art discipliné, où chaque cheesecake, brownie et tiramisu est préparé avec précision et soin.",
      p2: "Nous ne suivons pas les tendances ni ne prenons de raccourcis. Nous construisons quelque chose de durable — une marque dont les gens se souviennent, en qui ils ont confiance, et à laquelle ils reviennent. Chaque lot est une déclaration de qualité. Chaque commande est une opportunité de nous prouver.",
      p3: "Des commandes sur les réseaux sociaux à une expérience de marque complète, MojoDojo représente l'ambition, la constance et la poursuite acharnée de l'excellence à chaque bouchée.",
    },
    values: {
      title: 'Nos',
      titleAccent: 'Valeurs',
      items: [
        { title: 'Discipline', description: "Chaque produit répond à nos normes exigeantes — sans exception." },
        { title: 'Précision', description: "Ingrédients mesurés, technique constante, résultats parfaits." },
        { title: 'Passion', description: "Nous aimons ce que nous faisons, et cela se voit à chaque bouchée." },
        { title: 'Intégrité', description: "Ingrédients honnêtes, prix honnêtes, service honnête." },
      ],
    },
    team: {
      title: "L'équipe",
      titleAccent: 'MojoDojo',
      description: "Les personnes passionnées derrière chaque création MojoDojo.",
    },
  },
  order: {
    title: 'Sélectionnez',
    titleAccent: 'vos produits',
    subtitle: 'Ajoutez des articles à votre panier, puis procédez au paiement',
    addToCart: 'Ajouter au panier',
    checkout: 'Paiement',
    deposit: {
      title: 'Dépôt requis',
      description: "Les commandes supérieures à 100 $ nécessitent un dépôt de 20 $. Nous vous contacterons après la commande pour organiser le paiement.",
    },
    allergens: 'Allergènes / Régime',
    proceedToCheckout: 'Procéder au paiement',
    items: (n: number) => `${n} article${n !== 1 ? 's' : ''}`,
  },
  checkout: {
    title: 'Valider',
    titleAccent: 'la commande',
    subtitle: 'Vérifiez votre commande et remplissez vos coordonnées',
    backToProducts: 'Retour aux produits',
    yourDetails: 'Vos coordonnées',
    name: 'Nom complet',
    phone: 'Téléphone',
    email: 'Courriel',
    delivery: 'Livraison',
    pickup: 'Cueillette',
    deliveryAddress: 'Adresse de livraison',
    preferredDateTime: 'Date / heure préférée',
    paymentMethod: 'Mode de paiement',
    cash: 'Paiement à la livraison',
    online: 'Paiement en ligne',
    instructions: 'Instructions spéciales',
    instructionsPlaceholder: 'Allergies ou demandes spéciales...',
    placeOrder: 'Passer la commande',
    placingOrder: 'En cours…',
    depositNote: "Nous vous contacterons pour organiser le paiement du dépôt de 20 $ avant l'exécution.",
    orderSummary: 'Récapitulatif de la commande',
    subtotal: 'Sous-total',
    total: 'Total',
    emptyCart: 'Votre panier est vide',
    emptyCartSub: 'Ajoutez des produits avant de passer à la caisse.',
    browseProducts: 'Parcourir les produits',
    success: {
      title: 'Commande passée !',
      message: "Merci ! Nous confirmerons les détails de votre commande sous peu par courriel ou téléphone.",
      depositNote: "Un dépôt de 20 $ est requis pour les commandes supérieures à 100 $. Nous vous contacterons avec les détails du paiement.",
      returnHome: "Retour à l'accueil",
    },
  },
  common: {
    required: 'requis',
    learnMore: 'En savoir plus',
    contactUs: 'Contactez-nous',
  },
};
