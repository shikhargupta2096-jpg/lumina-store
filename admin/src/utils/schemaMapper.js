// React state -> camelCase
// Postgres -> snake_case

export const mapCategoryFromDB = (dbCategory) => ({
  id: dbCategory.id,
  name: dbCategory.name,
  subtitle: dbCategory.subtitle,
  shortDesc: dbCategory.short_desc,
  longDesc: dbCategory.long_desc,
  categoryType: dbCategory.category_type,
  tag: dbCategory.tag,
  img: dbCategory.img,
  displayOrder: dbCategory.display_order,
});

export const mapCategoryToDB = (clientCategory) => {
  const dbData = {
    name: clientCategory.name,
    subtitle: clientCategory.subtitle,
    short_desc: clientCategory.shortDesc,
    long_desc: clientCategory.longDesc,
    category_type: clientCategory.categoryType,
    tag: clientCategory.tag,
    img: clientCategory.img,
    display_order: clientCategory.displayOrder,
  };
  
  if (clientCategory.id) {
    dbData.id = clientCategory.id;
  }
  
  return dbData;
};

export const mapProductFromDB = (dbProduct) => ({
  id: dbProduct.id,
  name: dbProduct.name,
  categoryId: dbProduct.category_id,
  description: dbProduct.description,
  badge: dbProduct.badge,
  badgeClass: dbProduct.badge_class,
  tags: dbProduct.tags || [],
  specs: dbProduct.specs || [],
  lightingVariants: dbProduct.lighting_variants || [],
  img: dbProduct.img,
  lqip: dbProduct.lqip,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});

export const mapProductToDB = (clientProduct) => {
  const dbData = {
    name: clientProduct.name,
    category_id: clientProduct.categoryId,
    description: clientProduct.description,
    badge: clientProduct.badge,
    badge_class: clientProduct.badgeClass,
    img: clientProduct.img,
  };

  if (clientProduct.id) {
    dbData.id = clientProduct.id;
  }
  
  return dbData;
};

export const mapInquiryFromDB = (dbInquiry) => ({
  id: dbInquiry.id,
  name: dbInquiry.name,
  email: dbInquiry.email,
  interest: dbInquiry.interest,
  details: dbInquiry.details,
  source: dbInquiry.source,
  createdAt: dbInquiry.created_at,
});
