// תרגום הממשק: עברית (ברירת מחדל) וצרפתית.
// שמות המוצרים ותיאורי המבצעים מגיעים מהרשתות בעברית ולכן לא מתורגמים.
(function () {
  const params = new URLSearchParams(location.search);
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch {}
  const fromUrl = ["he", "fr"].includes(params.get("lang")) ? params.get("lang") : null;
  if (fromUrl) { try { localStorage.setItem("lang", fromUrl); } catch {} }
  const LANG = fromUrl || (["he", "fr"].includes(saved) ? saved : "he");
  const LOCALE = LANG === "fr" ? "fr-FR" : "he-IL";

  const S = {
    he: {
      title: "השוואת סל", skip: "דילוג לתוצאות", brand: "השוואת סל",
      h1: "איפה הסל שלכם זול יותר?",
      lead: "משווים מחירים בין אתרי המשלוחים של שופרסל, רמי לוי וטיב טעם, לפי המחירים הרשמיים שהרשתות מפרסמות.",
      search_label: "חיפוש מוצר", search_ph: "חפשו מוצר או ברקוד, למשל: חלב 3%, במבה",
      chains_label: "הרשתות שמושוות", depts_label: "מחלקות", products_label: "מוצרים", groups_label: "תתי-קטגוריות",
      only_multi: "רק מוצרים שנמכרים ביותר מרשת אחת", sort_label: "מיון",
      sort_popular: "הכי נפוצים", sort_saving: "הפער הכי גדול בין הרשתות", sort_cheap: "מחיר: מהזול ליקר", sort_name: "לפי שם",
      empty_home_title: "מתחילים מחלקה או מחיפוש",
      empty_home: "בחרו מחלקה למעלה, או הקלידו שם של מוצר. לכל מוצר תראו את המחיר בכל רשת, והזול ביותר מסומן.",
      more: "הצגת עוד מוצרים", more_n: "הצגת עוד מוצרים ({n} נוספים)",
      basket: "הסל שלי", basket_count: "מספר מוצרים בסל", clear: "ריקון הסל",
      foot: "המחירים מתוך קבצי שקיפות המחירים שהרשתות מחויבות לפרסם לפי חוק. מבצעי מועדון מוצגים בנפרד ולא נכללים בהשוואה.",
      pill: "{n} מוצרים, עודכן {when}", pill_none: "עוד לא עודכן",
      no_depts: "כדי לראות מחלקות, הריצו את 1_update_prices",
      dcount: "{n} מוצרים להשוואה", all_depts: "כל המחלקות", all: "הכל",
      empty_cat_title: "אין כאן מוצרים להשוואה",
      empty_cat: "נסו להוריד את הסימון \"רק מוצרים שנמכרים ביותר מרשת אחת\", או לבחור תת-קטגוריה אחרת.",
      count: "{n} מוצרים",
      not_found_title: "לא מצאנו \"{q}\"",
      not_found: "נסו מילה אחרת או קצרה יותר, למשל \"קוטג'\" במקום \"גבינת קוטג' 5%\", או הקלידו את הברקוד שעל האריזה.",
      not_sold: "לא נמכר כאן", cheapest: "הכי זול", sale: "מבצע", club: "במועדון {p}",
      by_weight: "במשקל, מחיר לק\"ג", barcode: "ברקוד",
      add: "הוספה לסל", add_aria: "הוספת {name} לסל", in_basket: "בסל ({n}) +",
      loading: "טוען מוצרים", less: "פחות {name}", more_of: "עוד {name}",
      basket_empty: "הוסיפו מוצרים, ונחשב בשבילכם באיזו רשת כל הסל יוצא הכי זול.",
      saving: "אפשר לחסוך עד <b>{p}</b> על הסל הזה", missing: "חסרים {n} מוצרים, המחיר חלקי",
      switch_to: "Français", switch_aria: "Passer au français",
    },
    fr: {
      title: "Comparateur de panier", skip: "Aller aux résultats", brand: "Comparateur de panier",
      h1: "Où votre panier coûte-t-il le moins cher ?",
      lead: "Comparez les prix des sites de livraison de Shufersal, Rami Levy et Tiv Taam, d'après les prix officiels publiés par les chaînes.",
      search_label: "Rechercher un produit", search_ph: "Produit ou code-barres, par ex. : חלב, במבה",
      chains_label: "Chaînes comparées", depts_label: "Rayons", products_label: "Produits", groups_label: "Sous-catégories",
      only_multi: "Seulement les produits vendus dans plusieurs chaînes", sort_label: "Trier",
      sort_popular: "Les plus courants", sort_saving: "Le plus grand écart entre chaînes", sort_cheap: "Prix croissant", sort_name: "Par nom",
      empty_home_title: "Commencez par un rayon ou une recherche",
      empty_home: "Choisissez un rayon ci-dessus ou tapez le nom d'un produit. Pour chaque produit, vous verrez le prix dans chaque chaîne, le moins cher étant mis en avant.",
      more: "Afficher plus de produits", more_n: "Afficher plus de produits ({n} restants)",
      basket: "Mon panier", basket_count: "Nombre d'articles dans le panier", clear: "Vider le panier",
      foot: "Prix issus des fichiers de transparence des prix que les chaînes sont tenues de publier par la loi. Les offres réservées aux membres sont affichées à part et ne sont pas comparées.",
      pill: "{n} produits, mis à jour le {when}", pill_none: "Pas encore mis à jour",
      no_depts: "Pour voir les rayons, lancez 1_update_prices",
      dcount: "{n} produits à comparer", all_depts: "Tous les rayons", all: "Tout",
      empty_cat_title: "Aucun produit à comparer ici",
      empty_cat: "Décochez « Seulement les produits vendus dans plusieurs chaînes » ou choisissez une autre sous-catégorie.",
      count: "{n} produits",
      not_found_title: "Aucun résultat pour « {q} »",
      not_found: "Les noms des produits sont en hébreu : essayez un mot hébreu plus court, par ex. « קוטג' », ou tapez le code-barres imprimé sur l'emballage.",
      not_sold: "Non vendu ici", cheapest: "Le moins cher", sale: "Promo", club: "Membres : {p}",
      by_weight: "Au poids, prix au kg", barcode: "Code-barres",
      add: "Ajouter au panier", add_aria: "Ajouter {name} au panier", in_basket: "Dans le panier ({n}) +",
      loading: "Chargement des produits", less: "Moins de {name}", more_of: "Plus de {name}",
      basket_empty: "Ajoutez des produits et nous calculerons dans quelle chaîne votre panier revient le moins cher.",
      saving: "Économisez jusqu'à <b>{p}</b> sur ce panier", missing: "{n} produits manquants, total partiel",
      switch_to: "עברית", switch_aria: "מעבר לעברית",
    },
  };

  // שמות המחלקות והקבוצות (מאתר רמי לוי) בצרפתית
  const CAT_FR = {
    "פירות ירקות ופיצוחים": "Fruits, légumes et fruits secs", "ירקות": "Légumes", "פירות": "Fruits",
    "פיצוחים ופירות יבשים": "Graines et fruits secs",
    "חלב ביצים וסלטים": "Laitages, œufs et salades", "חלב": "Lait", "ביצים": "Œufs", "גבינות": "Fromages",
    "מוצרי אפיה ובישול": "Beurre, crème et cuisine", "יוגורט ומעדני חלב": "Yaourts et desserts lactés",
    "מזון מצונן": "Produits frais", "סלטים": "Salades et tartinades",
    "בשר עוף ודגים": "Viande, volaille et poisson", "עוף טרי": "Poulet frais", "עוף קפוא": "Poulet surgelé",
    "בשר בקר וכבש טרי": "Bœuf et agneau frais", "בשר קפוא": "Viande surgelée", "בשרים על האש": "Grillades", "דגים": "Poisson",
    "משקאות ואלכוהול": "Boissons et alcools", "משקאות במארזים": "Boissons en pack", "משקאות חמים": "Boissons chaudes",
    "משקאות קלים": "Boissons fraîches", "תה וחליטות": "Thés et infusions", "תרכיזים": "Sirops et concentrés",
    "יינות": "Vins", "אלכוהול ואנרגיה": "Alcools et boissons énergisantes",
    "אורגני ובריאות": "Bio et santé", "אורגני וטבעוני": "Bio et végan", "נטול ומופחת סוכר": "Sans sucre ou allégé",
    "תחליפי גבינה וטופו": "Substituts de fromage et tofu", "ללא גלוטן": "Sans gluten",
    "מעדנים ללא לקטוז": "Desserts sans lactose", "מזון ותוספים לספורטאים": "Nutrition sportive",
    "קפוא ומצונן": "Surgelés et frais", "גלידות וארטיקים": "Glaces", "אוכל להכנה מהירה": "Plats rapides",
    "ירקות, פירות וצ'יפס קפואים": "Légumes, fruits et frites surgelés",
    "פיצות, מאפים ובצקים קפואים": "Pizzas, pâtisseries et pâtes surgelées", "תחליפי בשר": "Substituts de viande",
    "נקניקים ומזון מצונן": "Charcuterie et produits frais",
    "שימורים בישול ואפיה": "Conserves, cuisine et pâtisserie", "שימורים": "Conserves",
    "קמח ופירורי לחם": "Farine et chapelure", "שמן, חומץ ומיץ לימון": "Huile, vinaigre et jus de citron",
    "דבש, ריבות וממרחים": "Miel, confitures et pâtes à tartiner", "רטבים": "Sauces", "מרקים ותבשילים": "Soupes et plats cuisinés",
    "מוצרי יסוד ותבלינים": "Produits de base et épices", "מוצרי אפיה": "Pâtisserie", "המטבח האסייאתי": "Cuisine asiatique",
    "קטניות ודגנים": "Légumineuses et céréales", "אורז וקטניות": "Riz et légumineuses",
    "פסטה, פתיתים, קוסקוס": "Pâtes, ptitim et couscous", "דגנים וחטיפי אנרגיה": "Céréales et barres énergétiques",
    "פריכיות וקרקרים": "Galettes et crackers",
    "חטיפים ומתוקים": "Snacks et sucreries", "ממתקים": "Confiserie", "חטיפים מתוקים": "Snacks sucrés",
    "חטיפים מלוחים": "Snacks salés", "עוגות, עוגיות וופלים": "Gâteaux, biscuits et gaufrettes",
    "סוכריות ומסטיקים": "Bonbons et chewing-gums",
    "אחזקת הבית ובע\"ח": "Entretien et animaux", "מוצרי ניקיון לבית": "Produits ménagers", "מוצרי חשמל": "Électroménager",
    "אביזרי ניקיון": "Accessoires de nettoyage", "מוצרי כביסה": "Lessive", "ניקוי כלים": "Vaisselle",
    "קוטל חרקים ומבשמי אויר": "Insecticides et désodorisants", "הכל לבית": "Tout pour la maison",
    "ביגוד ואקססוריס": "Vêtements et accessoires", "מוצרי ילדים": "Articles pour enfants",
    "נייר וחד פעמי": "Papier et jetable", "חד פעמי": "Vaisselle jetable", "שקיות": "Sacs",
    "מוצרי נייר": "Produits en papier", "חד פעמי לבישול ואפייה": "Jetable pour cuisine et pâtisserie",
    "נרות וגפרורים": "Bougies et allumettes", "מנגל ומוצרים נלווים": "Barbecue et accessoires",
    "פארם ותינוקות": "Hygiène, beauté et bébé", "שמפו, מרכך וטיפוח שיער": "Shampoings et soins capillaires",
    "סבונים": "Savons", "דאודורנט": "Déodorants", "טיפוח פנים וגוף": "Soins du visage et du corps",
    "מוצרי הגיינה": "Hygiène", "היגיינת הפה": "Hygiène bucco-dentaire", "גילוח והסרת שיער": "Rasage et épilation",
    "מזון לתינוקות": "Alimentation bébé", "חיתולים ומגבונים": "Couches et lingettes",
    "טיפוח ואביזרי תינוקות וילדים": "Soins et accessoires bébé",
    "לחם ומאפים טריים": "Pain et viennoiseries", "לחם, פיתה, לחמניה": "Pain, pita et petits pains",
    "אחר": "Autres",
  };
  const CHAIN_FR = { shufersal: "Shufersal", rami_levy: "Rami Levy", tiv_taam: "Tiv Taam" };
  const UNIT_FR = { "גרם": "g", "גרמים": "g", "גר": "g", "קילוגרם": "kg", "ק\"ג": "kg", "ליטר": "L", "ליטרים": "L",
    "מיליליטר": "ml", "מ\"ל": "ml", "מל": "ml", "יחידות": "unités", "יחידה": "unité", "יח": "unités", "מטר": "m" };

  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars && k in vars ? vars[k] : "");
  window.LANG = LANG;
  window.t = (key, vars) => fill((S[LANG] && S[LANG][key]) ?? S.he[key] ?? key, vars);
  window.tc = (name) => LANG === "fr" ? (CAT_FR[name] || name) : name;
  window.tchain = (c) => LANG === "fr" ? (CHAIN_FR[c.key] || c.name) : c.name;
  window.tunit = (u) => LANG === "fr" ? (UNIT_FR[(u || "").trim()] || u) : u;
  window.fmtNum = (n) => Number(n).toLocaleString(LOCALE);
  window.fmtDate = (d) => d.toLocaleString(LOCALE, { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
  window.nis = (n) => new Intl.NumberFormat(LOCALE, { style: "currency", currency: "ILS",
    minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  // כיוון הדף ושפה
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "fr" ? "ltr" : "rtl";
  document.title = window.t("title");

  window.applyStaticText = function () {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = window.t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = window.t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", window.t(el.dataset.i18nAria)); });
    const sw = document.getElementById("lang-switch");
    if (sw) {
      sw.textContent = window.t("switch_to");
      sw.setAttribute("aria-label", window.t("switch_aria"));
      sw.lang = LANG === "fr" ? "he" : "fr";
      sw.onclick = () => {
        const next = LANG === "fr" ? "he" : "fr";
        try { localStorage.setItem("lang", next); } catch {}
        const u = new URL(location.href);
        u.searchParams.set("lang", next);
        location.href = u.toString();
      };
    }
  };
})();
