// ========== ИНТЕРФЕЙС ДЛЯ ПОЛЕЙ ФОРМ ==========
interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}

// ========== КАТЕГОРИИ И СПЕЦИАЛИЗАЦИИ ==========
export const categorySpecializations: Record<string, string[]> = {
  "Мужские стрижки": ["Мужские стрижки"],
  "Женские стрижки": ["Женские стрижки"],
  Окрашивание: ["Окрашивание"],
  Укладка: ["Укладка"],
  "Стрижка + укладка": ["Мужские стрижки", "Женские стрижки", "Укладка"],
  "Коррекция бровей": ["Коррекция бровей"],
  "Лечение волос": ["Лечение волос", "Уходовые процедуры"],
  "Уходовые процедуры": ["Уходовые процедуры", "Лечение волос"],
  "Наращивание волос": ["Наращивание волос"],
  "Химическая завивка": ["Химическая завивка"],
  "Вечерние прически": ["Вечерние прически", "Укладка"],
  "Свадебные прически": ["Свадебные прически", "Вечерние прически", "Укладка"],
};

export const categories = Object.keys(categorySpecializations);

// ========== ДНИ НЕДЕЛИ ==========
export const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

// ========== ОПЦИИ ДЛЯ ФИЛЬТРОВ ==========
export const experienceOptions = [
  { value: "0-2", label: "0-2 года" },
  { value: "3-5", label: "3-5 лет" },
  { value: "6-10", label: "6-10 лет" },
  { value: "10+", label: "10+ лет" },
];

export const specializationOptions = [
  "Мужские стрижки",
  "Женские стрижки",
  "Окрашивание",
  "Укладка",
  "Коррекция бровей",
  "Лечение волос",
  "Уходовые процедуры",
  "Наращивание волос",
  "Химическая завивка",
  "Вечерние прически",
  "Свадебные прически",
];

export const scheduleOptions = [
  { value: "5days", label: "5-дневка (ПН-ПТ)" },
  { value: "2-2", label: "Сменный 2/2" },
  { value: "weekend", label: "Только выходные" },
  { value: "full", label: "Полная неделя" },
];

// ========== ПОЛЯ ДЛЯ ФОРМ (С ТИПАМИ) ==========
export const personFields: FormField[] = [
  {
    name: "firstName",
    label: "Имя",
    type: "text",
    required: true,
    placeholder: "Введите имя",
  },
  {
    name: "lastName",
    label: "Фамилия",
    type: "text",
    required: true,
    placeholder: "Введите фамилию",
  },
  {
    name: "middleName",
    label: "Отчество",
    type: "text",
    placeholder: "Введите отчество",
  },
  { name: "birthDate", label: "Дата рождения", type: "date" },
  {
    name: "phone",
    label: "Телефон",
    type: "tel",
    placeholder: "+7 (999) 123-45-67",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "example@mail.com",
  },
];

export const barberFields: FormField[] = [
  ...personFields,
  {
    name: "experience",
    label: "Опыт (лет)",
    type: "number",
    placeholder: "Например: 5",
    min: "0",
  },
];

export const clientFields: FormField[] = [
  ...personFields,
  {
    name: "discount",
    label: "Скидка (%)",
    type: "number",
    placeholder: "Например: 10",
    min: "0",
    max: "100",
  },
];

// ========== ПОЛЯ ДЛЯ ФОРМ УСЛУГ ==========
export const serviceFields: FormField[] = [
  {
    name: "name",
    label: "Название",
    type: "text",
    required: true,
    placeholder: "Например: Мужская стрижка",
  },
  {
    name: "duration",
    label: "Длительность (мин)",
    type: "number",
    placeholder: "30",
    min: "0",
  },
  {
    name: "price",
    label: "Цена",
    type: "number",
    required: true,
    placeholder: "1000",
    min: "0",
    step: "0.01",
  },
];

// ========== ОПЦИИ ДЛЯ ФИЛЬТРАЦИИ КЛИЕНТОВ ==========
export const discountOptions = [
  { value: "0", label: "0%" },
  { value: "1-10", label: "1-10%" },
  { value: "11-20", label: "11-20%" },
  { value: "20+", label: "20%+" },
];

export const visitsOptions = [
  { value: "0", label: "Нет визитов" },
  { value: "1-3", label: "1-3 визита" },
  { value: "4-10", label: "4-10 визитов" },
  { value: "10+", label: "10+ визитов" },
];

export const ratingOptions = [
  { value: "", label: "Все" },
  { value: "5", label: "5 ★ - Отлично" },
  { value: "4", label: "4 ★ - Хорошо" },
  { value: "3", label: "3 ★ - Средне" },
  { value: "2", label: "2 ★ - Плохо" },
  { value: "1", label: "1 ★ - Ужасно" },
];

export const daysOfWeek = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

export const priceOptions = [
  { value: "", label: "Все" },
  { value: "0-500", label: "До 500 ₽" },
  { value: "500-1000", label: "500-1000 ₽" },
  { value: "1000-2000", label: "1000-2000 ₽" },
  { value: "2000+", label: "От 2000 ₽" },
];

export const popularityOptions = [
  { value: "", label: "Все" },
  { value: "0", label: "Нет выполнений" },
  { value: "1-5", label: "1-5 раз" },
  { value: "5-10", label: "5-10 раз" },
  { value: "10+", label: "10+ раз" },
];
