/** Misa's WhatsApp number (international, digits only). Not shown as text anywhere: traders open it with the button. */
export const MISA_WHATSAPP = (process.env.NEXT_PUBLIC_MISA_WHATSAPP || '2348161122458').replace(/\D/g, '');

/** Opens a chat with Misa, "Hi Misa" ready to send (WhatsApp app on a phone, WhatsApp Web on a computer). */
export const misaChatUrl = () => `https://wa.me/${MISA_WHATSAPP}?text=${encodeURIComponent('Hi Misa')}`;
