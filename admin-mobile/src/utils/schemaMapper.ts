export interface Category {
  id?: string;
  name: string;
  subtitle?: string;
  shortDesc?: string;
  longDesc?: string;
  categoryType?: string;
  tag?: string;
  img?: string;
  displayOrder?: number;
}

export interface DBCategory {
  id?: string;
  name: string;
  subtitle?: string;
  short_desc?: string;
  long_desc?: string;
  category_type?: string;
  tag?: string;
  img?: string;
  display_order?: number;
}

export interface Product {
  id?: string;
  name: string;
  categoryId: string;
  description?: string;
  badge?: string;
  badgeClass?: string;
  tags?: string[];
  specs?: any[];
  lightingVariants?: string[];
  img?: string;
  lqip?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DBProduct {
  id?: string;
  name: string;
  category_id: string;
  description?: string;
  badge?: string;
  badge_class?: string;
  tags?: string[];
  specs?: any[];
  lighting_variants?: string[];
  img?: string;
  lqip?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  interest: string;
  details: string;
  source: string;
  status: string;
  createdAt: string;
}

export interface DBInquiry {
  id: string;
  name: string;
  email: string;
  interest: string;
  details: string;
  source: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  userId: string;
  inquiryId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface DBNotification {
  id: string;
  user_id: string;
  inquiry_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export const mapCategoryFromDB = (dbCategory: DBCategory): Category => ({
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

export const mapCategoryToDB = (clientCategory: Category): DBCategory => {
  const dbData: DBCategory = {
    name: clientCategory.name,
    subtitle: clientCategory.subtitle,
    short_desc: clientCategory.shortDesc,
    long_desc: clientCategory.longDesc,
    category_type: clientCategory.categoryType,
    tag: clientCategory.tag,
    img: clientCategory.img,
    display_order: clientCategory.displayOrder,
  };
  if (clientCategory.id) dbData.id = clientCategory.id;
  return dbData;
};

export const mapProductFromDB = (dbProduct: DBProduct): Product => ({
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

export const mapProductToDB = (clientProduct: Product): DBProduct => {
  const dbData: DBProduct = {
    name: clientProduct.name,
    category_id: clientProduct.categoryId,
    description: clientProduct.description,
    badge: clientProduct.badge,
    badge_class: clientProduct.badgeClass,
    tags: clientProduct.tags || [],
    specs: clientProduct.specs || [],
    lighting_variants: clientProduct.lightingVariants || [],
    lqip: clientProduct.lqip,
    img: clientProduct.img,
  };
  if (clientProduct.id) dbData.id = clientProduct.id;
  return dbData;
};

export const mapInquiryFromDB = (dbInquiry: DBInquiry): Inquiry => ({
  id: dbInquiry.id,
  name: dbInquiry.name,
  email: dbInquiry.email,
  interest: dbInquiry.interest,
  details: dbInquiry.details,
  source: dbInquiry.source,
  status: dbInquiry.status || 'new',
  createdAt: dbInquiry.created_at,
});

export const mapInquiryToDB = (clientInquiry: Partial<Inquiry>) => {
  const dbData: any = {
    name: clientInquiry.name,
    email: clientInquiry.email,
    interest: clientInquiry.interest,
    details: clientInquiry.details,
    source: clientInquiry.source,
    status: clientInquiry.status,
  };
  if (clientInquiry.id) dbData.id = clientInquiry.id;
  return dbData;
};

export const mapNotificationFromDB = (dbNotification: DBNotification): Notification => ({
  id: dbNotification.id,
  userId: dbNotification.user_id,
  inquiryId: dbNotification.inquiry_id,
  title: dbNotification.title,
  body: dbNotification.body,
  isRead: dbNotification.is_read,
  createdAt: dbNotification.created_at,
});
