export const whatsappTemplates = {
  paymentLink: (name: string, orderId: string, link: string) =>
    `Bonjour ${name} ! 🍕\n\nVotre commande #${orderId.slice(0, 8)} est validée !\n\nMerci de procéder au paiement ici :\n${link}\n\nÀ très vite chez Pizza Dal Cielo ! 🌟`,

  inPreparation: (name: string, estimatedTime: string) =>
    `Bonjour ${name} ! 👨‍🍳\n\nVotre pizza est en cours de préparation !\nElle sera prête vers ${estimatedTime}.\n\nÀ tout de suite ! 🔥`,

  ready: (name: string) =>
    `Bonjour ${name} ! 🎉\n\nVotre pizza est prête !\nVous pouvez venir la récupérer dès maintenant.\n\n📍 Pizza Dal Cielo, Bellevue\n\nBonne dégustation ! 🍕`,

  delay: (name: string, newTime: string, reason: string = 'affluence') =>
    `Bonjour ${name} 😊\n\nNous avons un peu ${reason === 'affluence' ? "d'affluence" : 'de retard'} ce soir.\nVotre commande sera prête vers ${newTime} (au lieu de l'heure prévue).\n\nMerci de votre patience ! 🙏`,

  refused: (name: string, reason: string) =>
    `Bonjour ${name},\n\nNous ne pouvons malheureusement pas honorer votre commande ce soir.\nRaison : ${reason}\n\nDésolé pour le désagrément ! Vous pouvez repasser commande demain. 🙏\n\n- Pizza Dal Cielo`,

  cancelled: (name: string) =>
    `Bonjour ${name},\n\nVotre commande a bien été annulée comme demandé.\n\nN'hésitez pas à commander à nouveau quand vous le souhaitez ! 😊\n\n- Pizza Dal Cielo`,

  custom: (name: string, message: string) =>
    `Bonjour ${name},\n\n${message}\n\n- Pizza Dal Cielo 🍕`,
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}
