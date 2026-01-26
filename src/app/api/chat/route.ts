import { NextResponse } from 'next/server'
import { menuData, contactInfo } from '@/data/menuData'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    const msg = message.toLowerCase()

    let response = "Bonjour ! Je suis l'assistant virtuel de Pizza dal Cielo. Comment puis-je vous aider ? 🍕"

    // Simple rule-based logic for the chatbot
    if (msg.includes('menu') || msg.includes('carte') || msg.includes('pizza')) {
      const popular = menuData.pizzas.filter(p => p.popular).map(p => p.name).join(', ')
      response = `Nous avons une large sélection de pizzas artisanales ! Nos plus populaires sont : ${popular}. Vous pouvez voir toute la carte sur notre page Menu.`
    } else if (msg.includes('heure') || msg.includes('horaire') || msg.includes('ouvert')) {
      const hours = contactInfo.hours.map(h => `${h.day}: ${h.hours}`).join('\n')
      response = `Voici nos horaires d'ouverture :\n${hours}`
    } else if (msg.includes('contact') || msg.includes('appel') || msg.includes('téléphone')) {
      response = `Vous pouvez nous appeler au ${contactInfo.phone} ou nous envoyer un message sur WhatsApp. Nous sommes situés à ${contactInfo.address.street}, ${contactInfo.address.city}.`
    } else if (msg.includes('guylian') || msg.includes('fondateur') || msg.includes('propriétaire')) {
      response = `Pizza dal Cielo a été fondée en juin 2024 par Guylian Grangenois, un jeune passionné de 23 ans qui souhaitait apporter le meilleur de la pizza artisanale à Fort-de-France.`
    } else if (msg.includes('prix') || msg.includes('coûte')) {
      response = `Nos pizzas classiques commencent à 11€ et nos signatures à partir de 15€. Vous pouvez consulter les prix détaillés sur notre page Menu.`
    } else if (msg.includes('livraison') || msg.includes('livre')) {
      response = "Actuellement, nous proposons uniquement la vente à emporter dans notre boutique de Bellevue. Passez nous voir pour récupérer votre pizza bien chaude !"
    } else if (msg.includes('perso') || msg.includes('créer') || msg.includes('composer') || msg.includes('choisir')) {
      response = "Vous pouvez créer votre propre pizza sur notre page 'Perso' ! Choisissez votre base, votre sauce et vos garnitures préférées pour une pizza unique."
    } else if (msg.includes('réserver') || msg.includes('reservation') || msg.includes('table')) {
      response = "Pour réserver une table, vous pouvez nous appeler directement au +596 696 88 72 70. Nous vous accueillons du mardi au samedi à partir de 18h !"
    } else if (msg.includes('où') || msg.includes('adresse') || msg.includes('situe')) {
      response = `Nous sommes situés au coeur de Bellevue, à Fort-de-France (97200), Martinique. Vous pouvez trouver l'itinéraire exact sur notre page Contact.`
    } else if (msg.includes('pizza du chef')) {
      response = "La Pizza du Chef est notre signature ! Elle est préparée avec une base tomate, de la mozzarella et une sélection secrète d'ingrédients frais du jour. C'est un incontournable à 19€."
    } else if (msg.includes('merci') || msg.includes('thanks')) {
      response = "De rien ! N'hésitez pas si vous avez d'autres questions. À bientôt chez Pizza dal Cielo ! 🍕"
    } else if (msg.includes('salut') || msg.includes('bonjour') || msg.includes('hello')) {
      response = "Bonjour ! Je suis l'assistant de Pizza dal Cielo. Je peux vous renseigner sur notre menu, nos horaires ou notre histoire. Que voulez-vous savoir ?"
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
