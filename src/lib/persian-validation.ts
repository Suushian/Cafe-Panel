"use client";

type FormEl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function persianValidityMessage(el: FormEl): string {
  const v = el.validity;

  if (v.valueMissing) {
    return "لطفاً این فیلد را پر کن.";
  }
  if (v.tooShort) {
    const min = (el as HTMLInputElement).minLength;
    return `حداقل ${min.toLocaleString("fa-IR")} کاراکتر لازم است.`;
  }
  if (v.tooLong) {
    const max = (el as HTMLInputElement).maxLength;
    return `حداکثر ${max.toLocaleString("fa-IR")} کاراکتر مجاز است.`;
  }
  if (v.typeMismatch) {
    const type = (el as HTMLInputElement).type;
    if (type === "email") return "فرمت ایمیل معتبر نیست.";
    if (type === "tel") return "فرمت شماره تلفن معتبر نیست.";
    if (type === "url") return "فرمت آدرس اینترنتی معتبر نیست.";
    return "مقدار وارد شده با نوع فیلد هماهنگ نیست.";
  }
  if (v.rangeUnderflow) {
    const min = (el as HTMLInputElement).min;
    return `مقدار باید حداقل ${Number(min).toLocaleString("fa-IR")} باشد.`;
  }
  if (v.rangeOverflow) {
    const max = (el as HTMLInputElement).max;
    return `مقدار باید حداکثر ${Number(max).toLocaleString("fa-IR")} باشد.`;
  }
  if (v.patternMismatch) {
    return "قالب وارد شده با الگوی مورد انتظار هماهنگ نیست.";
  }
  if (v.stepMismatch) {
    return "مقدار وارد شده مضربی از گام مورد نظر نیست.";
  }
  if (v.badInput) {
    return "عدد وارد شده معتبر نیست.";
  }
  return "مقدار وارد شده معتبر نیست.";
}