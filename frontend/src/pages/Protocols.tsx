import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, Lock, X, ChevronRight, CheckCircle2, Play, Pause } from 'lucide-react'
import { usePremium } from '../hooks/usePremium'

const CATEGORIES = ['Tous', 'Anti-rumination', 'Respiration', 'Retour au corps', 'Hypervigilance', 'Sommeil', 'Sécurité émotionnelle']

const TAG_COLORS: Record<string, string> = {
  'Anti-rumination':       'text-violet-400 bg-violet-400/10',
  'Respiration':           'text-blue-400 bg-blue-400/10',
  'Retour au corps':       'text-emerald-400 bg-emerald-400/10',
  'Hypervigilance':        'text-rose-400 bg-rose-400/10',
  'Sommeil':               'text-indigo-400 bg-indigo-400/10',
  'Sécurité émotionnelle': 'text-amber-400 bg-amber-400/10',
}

interface Step {
  title: string
  instruction: string
  duration?: string
}

interface Protocol {
  id: string
  category: string
  duration: string
  title: string
  description: string
  premium: boolean
  goal: string
  when: string
  steps: Step[]
  closing: string
}

const PROTOCOLS: Protocol[] = [
  {
    id: 'ancrage-5-sens',
    category: 'Anti-rumination',
    duration: '3 min',
    title: 'Ancrage par les 5 sens',
    description: 'Ramène ton attention au moment présent quand les pensées s\'emballent.',
    premium: false,
    goal: 'Interrompre la spirale de pensées et revenir ici, maintenant.',
    when: 'Quand tu rumines, que ton esprit part dans tous les sens, ou après une situation stressante.',
    steps: [
      {
        title: '5 choses que tu vois',
        instruction: 'Regarde autour de toi. Nomme mentalement 5 objets distincts. Prends le temps de vraiment les observer — leur forme, leur couleur, leur texture.',
        duration: '30 sec',
      },
      {
        title: '4 choses que tu touches',
        instruction: 'Pose ta main sur 4 surfaces différentes. Remarque la température, la texture, la dureté. Sol sous tes pieds, tissu de tes vêtements, table...',
        duration: '30 sec',
      },
      {
        title: '3 choses que tu entends',
        instruction: 'Ferme les yeux. Écoute attentivement. Identifie 3 sons distincts — proche, loin, dans ton corps.',
        duration: '30 sec',
      },
      {
        title: '2 choses que tu sens',
        instruction: 'Identifie 2 odeurs ou saveurs présentes. Si rien ne se présente, inspire lentement et remarque l\'air.',
        duration: '20 sec',
      },
      {
        title: '1 chose que tu ressens',
        instruction: 'Une seule sensation physique bienveillante — la chaleur de ta respiration, le contact du sol, la détente dans tes épaules.',
        duration: '30 sec',
      },
    ],
    closing: 'Tu es là. Présent·e. Les pensées peuvent reprendre leur place — plus doucement, maintenant.',
  },
  {
    id: 'coherence-cardiaque',
    category: 'Respiration',
    duration: '5 min',
    title: 'Cohérence cardiaque 4–6',
    description: 'Régule ton système nerveux en 5 minutes grâce au rythme respiratoire.',
    premium: false,
    goal: 'Activer le système nerveux parasympathique pour réduire le stress et l\'anxiété.',
    when: 'Avant une situation stressante, après une charge émotionnelle, ou 3 fois par jour pour un effet durable.',
    steps: [
      {
        title: 'Installe-toi',
        instruction: 'Assieds-toi confortablement, dos droit, pieds à plat au sol. Pose les mains sur tes cuisses. Ferme les yeux ou fixe un point devant toi.',
        duration: '30 sec',
      },
      {
        title: 'Inspire — 4 secondes',
        instruction: 'Inspire lentement par le nez en comptant 1... 2... 3... 4. Laisse ton ventre se gonfler en premier, puis ta poitrine. Ne force pas.',
        duration: '4 sec',
      },
      {
        title: 'Expire — 6 secondes',
        instruction: 'Expire doucement par la bouche en comptant 1... 2... 3... 4... 5... 6. Laisse l\'air sortir naturellement, sans vider de force.',
        duration: '6 sec',
      },
      {
        title: 'Répète le cycle',
        instruction: 'Continue ce rythme — 4 secondes d\'inspiration, 6 secondes d\'expiration. Environ 5 cycles par minute. Si ton esprit part, ramène-le doucement au souffle.',
        duration: '4 min',
      },
      {
        title: 'Retour en douceur',
        instruction: 'Reprends une respiration normale. Reste quelques secondes les yeux fermés. Remarque comment tu te sens — plus posé·e, plus ancré·e.',
        duration: '30 sec',
      },
    ],
    closing: 'Ton système nerveux s\'est régulé. Cet effet dure 4 à 6 heures après une séance.',
  },
  {
    id: 'scan-corporel',
    category: 'Retour au corps',
    duration: '7 min',
    title: 'Scan corporel doux',
    description: 'Parcours ton corps avec bienveillance pour libérer les tensions stockées.',
    premium: false,
    goal: 'Identifier et relâcher les tensions physiques liées au stress ou aux émotions.',
    when: 'En fin de journée, avant de dormir, ou quand tu te sens tendu·e sans savoir pourquoi.',
    steps: [
      {
        title: 'Position de départ',
        instruction: 'Allonge-toi sur le dos, bras le long du corps, paumes vers le haut. Ou assieds-toi confortablement. Ferme les yeux.',
        duration: '30 sec',
      },
      {
        title: 'La tête et le visage',
        instruction: 'Commence par le sommet du crâne. Descends vers le front — relâche les sourcils, l\'espace entre les yeux. Mâchoire, nuque... laisse tout se détendre sans forcer.',
        duration: '1 min',
      },
      {
        title: 'Les épaules et les bras',
        instruction: 'Les épaules portent beaucoup. Remarque leur position — s\'élèvent-elles vers les oreilles ? Laisse-les tomber naturellement. Descends le long des bras jusqu\'aux doigts.',
        duration: '1 min 30',
      },
      {
        title: 'La poitrine et le ventre',
        instruction: 'Observe ta respiration dans cette zone. Serre-t-il quelque chose ? Pas besoin de changer — juste remarquer. Avec chaque expiration, imagine que cette zone se détend un peu plus.',
        duration: '1 min 30',
      },
      {
        title: 'Le bas du dos et les hanches',
        instruction: 'Zone de tension fréquente. Remarque le contact avec le sol ou le siège. Laisse ton poids être porté. Rien à faire, juste abandonner.',
        duration: '1 min',
      },
      {
        title: 'Les jambes et les pieds',
        instruction: 'Descends le long des cuisses, des genoux, des mollets. Jusqu\'aux pieds, aux orteils. Relâche chaque centimètre. Tes pieds portent tout ton poids toute la journée — mercie-les.',
        duration: '1 min',
      },
    ],
    closing: 'Reste quelques respirations dans cet état. Tu peux bouger doucement quand tu es prêt·e.',
  },
  {
    id: 'protocole-securite',
    category: 'Hypervigilance',
    duration: '4 min',
    title: 'Protocole de sécurité',
    description: 'Désactive la réponse d\'alarme quand ton système nerveux sursaute sans danger réel.',
    premium: true,
    goal: 'Signaler à ton cerveau que tu es en sécurité — interrompre la réponse de menace.',
    when: 'Quand tu es en alerte sans raison apparente, anxieux·se, ou que ton corps est en mode survie.',
    steps: [
      {
        title: 'Oriente-toi dans l\'espace',
        instruction: 'Tourne lentement la tête de gauche à droite, comme si tu explorais la pièce. Ce mouvement envoie un signal de sécurité à ton système nerveux. Fais-le 3 fois.',
        duration: '30 sec',
      },
      {
        title: 'Sécurise tes appuis',
        instruction: 'Appuie tes deux pieds fermement au sol. Sens leur contact. Pose les mains à plat sur une surface stable. Tu as des points d\'ancrage solides.',
        duration: '30 sec',
      },
      {
        title: 'Soupir physiologique',
        instruction: 'Inspire par le nez. Puis prends une seconde petite inspiration — comme si tu remplissais les derniers alvéoles. Expire lentement par la bouche. Ce double-inspire active immédiatement la détente. Répète 3 fois.',
        duration: '1 min',
      },
      {
        title: 'Affirmation de sécurité',
        instruction: 'Dis intérieurement, lentement : "Je suis ici. Je suis en sécurité. Ce que je ressens est une réponse de mon corps, pas un danger réel." Laisse ces mots résonner.',
        duration: '30 sec',
      },
      {
        title: 'Retour au présent',
        instruction: 'Nomme 3 choses que tu vois en ce moment, à voix haute si possible. Cela ramène ton cerveau dans le cortex préfrontal — hors du mode alarme.',
        duration: '1 min',
      },
    ],
    closing: 'L\'alarme peut prendre quelques minutes à se calmer complètement. C\'est normal. Tu as fait ce qu\'il fallait.',
  },
  {
    id: 'depose-mentale-soir',
    category: 'Sommeil',
    duration: '10 min',
    title: 'Dépose mentale du soir',
    description: 'Un rituel pour poser le poids de la journée avant de dormir.',
    premium: true,
    goal: 'Vider le "tampon mental" pour entrer dans le sommeil sans rumination ni tension résiduelle.',
    when: 'Dans les 30 minutes avant le coucher. À faire allongé·e ou assis·e dans le calme.',
    steps: [
      {
        title: 'Le bilan en 3 mots',
        instruction: 'Pense à ta journée. Trouve 3 mots qui la résument — sans jugement. Joyeux, épuisant, flou, chargé, doux... Juste 3 mots, puis laisse-les partir.',
        duration: '1 min',
      },
      {
        title: 'La liste de demain',
        instruction: 'Écris mentalement (ou sur papier) les 3 choses qui t\'attendent demain. En les nommant, tu dis à ton cerveau qu\'elles sont "rangées" et qu\'il peut lâcher.',
        duration: '2 min',
      },
      {
        title: 'La respiration 4-7-8',
        instruction: 'Inspire 4 secondes. Retiens 7 secondes. Expire 8 secondes. Cette technique ralentit le rythme cardiaque et prépare le sommeil. Répète 4 cycles.',
        duration: '3 min',
      },
      {
        title: 'Le scan de relâchement',
        instruction: 'Commence par le visage. Relâche. Les épaules. Relâche. Le ventre. Relâche. Jambes. Relâche. Sens ton corps s\'enfoncer dans la surface qui te porte.',
        duration: '2 min',
      },
      {
        title: 'L\'image de sécurité',
        instruction: 'Visualise un endroit où tu te sens en sécurité — réel ou imaginaire. Mer, forêt, chambre d\'enfance... Reste dans cet espace. Laisse ta respiration devenir plus lente, plus profonde.',
        duration: '2 min',
      },
    ],
    closing: 'Tu peux t\'endormir maintenant. La journée est déposée. Tu as fait ce que tu pouvais.',
  },
  {
    id: 'auto-compassion',
    category: 'Sécurité émotionnelle',
    duration: '3 min',
    title: 'Auto-compassion rapide',
    description: 'Un geste de douceur envers toi-même dans les moments difficiles.',
    premium: true,
    goal: 'Remplacer la critique intérieure par une présence bienveillante.',
    when: 'Quand tu es dur·e envers toi-même, après un échec, ou dans un moment de souffrance.',
    steps: [
      {
        title: 'Reconnais la souffrance',
        instruction: 'Pose une main sur ton cœur ou ton ventre. Dis intérieurement : "C\'est un moment difficile. Je souffre en ce moment." Pas de minimisation. Juste reconnaître.',
        duration: '30 sec',
      },
      {
        title: 'L\'humanité partagée',
        instruction: 'Rappelle-toi : souffrir, échouer, se sentir insuffisant·e — c\'est humain. Des millions de personnes ressentent exactement la même chose en ce moment. Tu n\'es pas seul·e.',
        duration: '30 sec',
      },
      {
        title: 'La phrase de bienveillance',
        instruction: 'Dis-toi ce que tu dirais à un·e ami·e proche dans la même situation. Peut-être : "Tu fais de ton mieux. C\'est suffisant. Tu mérites d\'être traité·e avec douceur."',
        duration: '1 min',
      },
      {
        title: 'Le geste physique',
        instruction: 'Garde la main sur ton cœur. Sens sa chaleur. Appuie doucement. Ce contact physique active les mêmes circuits que la bienveillance d\'un proche.',
        duration: '1 min',
      },
    ],
    closing: 'Tu mérites la même compassion que tu donnes aux autres. Toujours.',
  },
  {
    id: 'recadrage-cognitif',
    category: 'Anti-rumination',
    duration: '5 min',
    title: 'Recadrage cognitif',
    description: 'Transforme une pensée négative automatique en perspective plus juste.',
    premium: true,
    goal: 'Identifier les distorsions cognitives et remplacer les pensées automatiques destructrices.',
    when: 'Quand une pensée négative tourne en boucle, après un conflit ou une critique reçue.',
    steps: [
      {
        title: 'Identifie la pensée',
        instruction: 'Quelle est exactement la pensée qui revient ? Écris-la ou formule-la clairement : "Je suis nul·le", "Ça ne marchera jamais", "Tout le monde me juge"... Sois précis·e.',
        duration: '1 min',
      },
      {
        title: 'Évalue la preuve',
        instruction: 'Pose-toi cette question : quelles sont les preuves concrètes que cette pensée est vraie ? Et quelles sont les preuves qu\'elle est fausse ou exagérée ? Les deux côtés.',
        duration: '1 min 30',
      },
      {
        title: 'Cherche l\'alternative',
        instruction: 'Si un·e ami·e te disait cette pensée sur lui/elle, que lui répondrais-tu ? Formule une pensée alternative plus équilibrée — pas forcément positive, juste plus réaliste.',
        duration: '1 min',
      },
      {
        title: 'Teste l\'impact',
        instruction: 'Compare les deux pensées. La pensée automatique vs la pensée alternative. Laquelle te donne plus d\'espace pour agir ? Laquelle est plus utile pour toi maintenant ?',
        duration: '30 sec',
      },
      {
        title: 'Ancre la nouvelle perspective',
        instruction: 'Répète la pensée alternative 3 fois, lentement. Pas pour te convaincre de force — juste pour l\'inscrire. Prends une grande inspiration. Expire lentement.',
        duration: '1 min',
      },
    ],
    closing: 'Les pensées ne sont pas des faits. Tu peux les questionner — et choisir celle qui t\'aide à avancer.',
  },
  {
    id: 'respiration-478',
    category: 'Respiration',
    duration: '4 min',
    title: 'Respiration 4-7-8',
    description: 'Une technique puissante pour calmer rapidement le système nerveux.',
    premium: true,
    goal: 'Activer la réponse de relaxation profonde et réduire l\'anxiété en moins de 4 minutes.',
    when: 'Avant de dormir, lors d\'une crise d\'anxiété, ou quand tu ressens une montée de stress intense.',
    steps: [
      {
        title: 'Prépare-toi',
        instruction: 'Assieds-toi ou allonge-toi. Vide complètement tes poumons par la bouche avec un soupir audible. Pose ta langue derrière tes dents du haut — elle y reste tout au long.',
        duration: '30 sec',
      },
      {
        title: 'Inspire — 4 secondes',
        instruction: 'Ferme la bouche. Inspire silencieusement par le nez en comptant 1... 2... 3... 4. Sens ton ventre et ta poitrine se gonfler doucement.',
        duration: '4 sec',
      },
      {
        title: 'Retiens — 7 secondes',
        instruction: 'Retiens ta respiration, bouche fermée, en comptant 1... 2... 3... 4... 5... 6... 7. Ne force pas. Si c\'est trop long au début, adapte le rythme.',
        duration: '7 sec',
      },
      {
        title: 'Expire — 8 secondes',
        instruction: 'Expire complètement par la bouche avec un son de souffle en comptant 1... 2... 3... 4... 5... 6... 7... 8. C\'est l\'expiration la plus importante — laisse tout sortir.',
        duration: '8 sec',
      },
      {
        title: 'Répète 4 cycles',
        instruction: 'Recommence depuis l\'inspiration. Fais 4 cycles complets. Après le 4ème, reprends une respiration naturelle et remarque le calme qui s\'installe.',
        duration: '3 min',
      },
    ],
    closing: 'Cette technique agit comme un tranquillisant naturel sur ton système nerveux. Pratique-la quotidiennement pour un effet durable.',
  },
  {
    id: 'relaxation-musculaire',
    category: 'Retour au corps',
    duration: '10 min',
    title: 'Relaxation musculaire progressive',
    description: 'Contracte et relâche chaque groupe musculaire pour libérer les tensions profondes.',
    premium: true,
    goal: 'Relâcher les tensions musculaires chroniques liées au stress et induire un état de calme profond.',
    when: 'En cas de tension physique importante, avant de dormir, ou après une longue journée stressante.',
    steps: [
      {
        title: 'Position et respiration',
        instruction: 'Allonge-toi sur le dos, les bras le long du corps. Prends 3 grandes inspirations lentes. Avec chaque expiration, sens ton corps s\'alourdir un peu plus.',
        duration: '1 min',
      },
      {
        title: 'Pieds et mollets',
        instruction: 'Contracte fortement tes orteils et tes pieds pendant 5 secondes — comme si tu voulais les recroqueviller. Puis relâche d\'un coup. Remarque la différence. Répète avec les mollets.',
        duration: '2 min',
      },
      {
        title: 'Cuisses, fessiers, ventre',
        instruction: 'Contracte les cuisses en serrant fort, puis les fessiers, puis le ventre. 5 secondes chacun, puis relâche. Sens la chaleur qui se répand dans ces zones.',
        duration: '2 min',
      },
      {
        title: 'Mains, bras, épaules',
        instruction: 'Serre les poings fort pendant 5 secondes. Relâche. Contracte les avant-bras. Relâche. Monte jusqu\'aux épaules — hausse-les vers les oreilles 5 secondes. Laisse-les tomber.',
        duration: '2 min',
      },
      {
        title: 'Visage et nuque',
        instruction: 'Plisse le visage entier : front, yeux, mâchoire serrée, 5 secondes. Puis relâche tout d\'un coup. Pousse doucement ta tête contre le sol pour contracter la nuque. Relâche.',
        duration: '2 min',
      },
      {
        title: 'Intégration finale',
        instruction: 'Parcours mentalement ton corps de la tête aux pieds. S\'il reste une zone tendue, contracte-la une dernière fois et relâche. Reste dans ce calme quelques instants.',
        duration: '1 min',
      },
    ],
    closing: 'Ton corps sait se détendre. Tu lui as juste rappelé comment.',
  },
  {
    id: 'decharge-nerveuse',
    category: 'Hypervigilance',
    duration: '6 min',
    title: 'Décharge du système nerveux',
    description: 'Libère l\'énergie de survie bloquée dans le corps après un état de stress intense.',
    premium: true,
    goal: 'Permettre au corps de compléter la réponse de stress interrompue et retrouver l\'équilibre.',
    when: 'Après une situation stressante, une dispute, une peur intense, ou quand le corps reste "sur les nerfs".',
    steps: [
      {
        title: 'Mouvement de tremblements',
        instruction: 'Debout ou assis, laisse tes jambes vibrer légèrement — comme si tu tremblais de froid. Ce tremblement naturel est ce que les animaux font après un stress pour se "décharger". 1 minute.',
        duration: '1 min',
      },
      {
        title: 'Secousse des bras',
        instruction: 'Secoue tes bras le long du corps, comme si tu voulais te débarrasser de l\'eau sur tes mains. Laisse cette secousse remonter jusqu\'aux épaules. Reste souple.',
        duration: '1 min',
      },
      {
        title: 'Le soupir de libération',
        instruction: 'Inspire profondément par le nez. Puis expire en laissant un son sortir — "aaah", "ohhh", ou un soupir sonore. Sans te censurer. Le son aide à libérer la tension du diaphragme.',
        duration: '1 min',
      },
      {
        title: 'Marche de décharge',
        instruction: 'Marche dans l\'espace — même sur place. En marchant, balance les bras librement. Commence lentement, accélère légèrement, puis ralentis. La marche aide à compléter la réponse de fuite.',
        duration: '2 min',
      },
      {
        title: 'Retour au calme',
        instruction: 'Arrête-toi. Pose les deux pieds au sol. Prends 3 respirations lentes. Pose une main sur le sternum, l\'autre sur le ventre. Sens ton cœur ralentir.',
        duration: '1 min',
      },
    ],
    closing: 'Le stress est une énergie — tu viens de lui donner une sortie. Ton corps peut se réinitialiser maintenant.',
  },
  {
    id: 'rituel-endormissement',
    category: 'Sommeil',
    duration: '8 min',
    title: 'Rituel d\'endormissement',
    description: 'Un protocole complet pour préparer ton cerveau et ton corps au sommeil.',
    premium: true,
    goal: 'Créer un pont entre l\'état d\'éveil et le sommeil en apaisant le mental et le corps.',
    when: 'Dans les 20 minutes avant le coucher. À faire dans ta chambre, lumière tamisée.',
    steps: [
      {
        title: 'Coupe le flux',
        instruction: 'Pose ton téléphone face vers le bas hors de portée. Tamise la lumière. Cette coupure physique dit à ton cerveau que le mode "actif" est terminé. 30 secondes pour t\'installer.',
        duration: '30 sec',
      },
      {
        title: 'Bilan de gratitude',
        instruction: 'Nomme mentalement 3 choses qui se sont bien passées aujourd\'hui — même petites. Un café chaud, une conversation, un moment de calme. La gratitude réduit le cortisol.',
        duration: '1 min 30',
      },
      {
        title: 'Libère les non-terminés',
        instruction: 'Qu\'est-ce qui reste en suspens dans ton esprit ? Nomme-le simplement et dis : "Je n\'ai pas à régler ça maintenant. Je le confie au demain." Ça suffit à débloquer le mental.',
        duration: '1 min',
      },
      {
        title: 'Respiration apaisante',
        instruction: 'Inspire 4 secondes par le nez. Expire 8 secondes par la bouche. L\'expiration deux fois plus longue que l\'inspiration. Fais 5 cycles. Ton rythme cardiaque va naturellement baisser.',
        duration: '3 min',
      },
      {
        title: 'Scan descendant',
        instruction: 'Commence par le sommet du crâne. Descends lentement. À chaque zone, expire et relâche. Front... yeux... mâchoire... cou... épaules... poitrine... ventre... jambes... pieds.',
        duration: '2 min',
      },
    ],
    closing: 'Tu peux laisser tes yeux rester fermés. Ton corps sait ce qu\'il doit faire. Laisse-le faire.',
  },
  {
    id: 'lettre-a-soi',
    category: 'Sécurité émotionnelle',
    duration: '8 min',
    title: 'Lettre à soi-même',
    description: 'Écris à la partie de toi qui souffre avec la bienveillance d\'un ami proche.',
    premium: true,
    goal: 'Créer une distance saine avec la douleur et renforcer la relation bienveillante avec soi-même.',
    when: 'Après une erreur, une honte, un sentiment d\'échec, ou quand tu es très dur·e envers toi-même.',
    steps: [
      {
        title: 'Prends un stylo (ou ton téléphone)',
        instruction: 'Écrire à la main crée un effet plus fort, mais n\'importe quel support marche. Installe-toi dans un endroit calme. Prends une grande inspiration.',
        duration: '30 sec',
      },
      {
        title: 'Commence par le ressenti',
        instruction: 'Écris ce que tu ressens sans te censurer. "Je me sens...", "J\'ai l\'impression de...", "Ce qui me pèse c\'est...". Pas de mise en forme, juste l\'honnêteté brute.',
        duration: '2 min',
      },
      {
        title: 'Change de perspective',
        instruction: 'Maintenant, imagine un·e ami·e très proche qui vit exactement ce que tu vis. Que lui écrirais-tu ? Commence la lettre par "Cher·e [ton prénom]," et écris-lui comme à cet ami.',
        duration: '3 min',
      },
      {
        title: 'Reconnais l\'effort',
        instruction: 'Termine en reconnaissant quelque chose que tu fais bien, même en ce moment difficile. Même juste : "Tu continues malgré tout. C\'est courageux."',
        duration: '1 min',
      },
      {
        title: 'Relis à voix basse',
        instruction: 'Relis ce que tu as écrit — lentement, pour toi-même. Laisse les mots entrer. Tu mérites d\'entendre ça.',
        duration: '1 min 30',
      },
    ],
    closing: 'Cette lettre t\'appartient. Garde-la, ou dépose-la. Dans les deux cas, quelque chose en toi a été entendu.',
  },
]

function ProtocolModal({ protocol, onClose }: { protocol: Protocol; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [running, setRunning] = useState(false)

  const step = protocol.steps[currentStep]
  const isLast = currentStep === protocol.steps.length - 1

  const next = () => {
    if (isLast) {
      setCompleted(true)
    } else {
      setCurrentStep(s => s + 1)
      setRunning(false)
    }
  }

  const tagColor = TAG_COLORS[protocol.category] ?? 'text-slate-400 bg-slate-400/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-navy-700">
          <div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColor} mb-2 inline-block`}>
              {protocol.category}
            </span>
            <h2 className="text-lg font-bold text-white">{protocol.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {protocol.duration}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        {completed ? (
          /* Completion screen */
          <div className="px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold text-lg mb-3">Protocole terminé</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">"{protocol.closing}"</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-sm font-semibold transition-colors"
            >
              Terminer
            </button>
          </div>
        ) : (
          <>
            {/* Intro (step 0 not started) or Step view */}
            {currentStep === 0 && !running ? (
              <div className="px-6 py-5">
                <div className="rounded-xl bg-navy-800 border border-navy-700 px-4 py-3 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Objectif</p>
                  <p className="text-sm text-slate-300">{protocol.goal}</p>
                </div>
                <div className="rounded-xl bg-navy-800 border border-navy-700 px-4 py-3 mb-5">
                  <p className="text-xs text-slate-500 mb-1">Quand l'utiliser</p>
                  <p className="text-sm text-slate-300">{protocol.when}</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">{protocol.steps.length} étapes · {protocol.duration}</p>
                <button
                  onClick={() => setRunning(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold text-sm transition-colors"
                >
                  <Play size={14} />
                  Commencer le protocole
                </button>
              </div>
            ) : (
              <div className="px-6 py-5">
                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-5">
                  {protocol.steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < currentStep ? 'bg-periwinkle-500' :
                        i === currentStep ? 'bg-periwinkle-400' :
                        'bg-navy-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-500 mb-1">Étape {currentStep + 1} / {protocol.steps.length}</p>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  {step.duration && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={11} /> {step.duration}
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-navy-800 border border-navy-700 px-4 py-4 mb-5">
                  <p className="text-sm text-slate-300 leading-relaxed">{step.instruction}</p>
                </div>

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={() => { setCurrentStep(s => s - 1); setRunning(true) }}
                      className="px-4 py-2.5 rounded-xl border border-navy-600 text-slate-400 text-sm hover:text-white hover:bg-navy-800 transition-colors"
                    >
                      Retour
                    </button>
                  )}
                  <button
                    onClick={next}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold text-sm transition-colors"
                  >
                    {isLast ? (
                      <>
                        <CheckCircle2 size={14} />
                        Terminer
                      </>
                    ) : (
                      <>
                        Étape suivante
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function Protocols() {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const isPremium = usePremium()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) {
      const protocol = PROTOCOLS.find(p => p.id === openId)
      if (protocol && (!protocol.premium || isPremium)) {
        setSelectedProtocol(protocol)
      }
    }
  }, [searchParams, isPremium])

  const filtered = activeCategory === 'Tous'
    ? PROTOCOLS
    : PROTOCOLS.filter(p => p.category === activeCategory)

  const handleClick = (p: Protocol) => {
    if (p.premium && !isPremium) return
    setSelectedProtocol(p)
  }

  return (
    <>
      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-3xl pb-24 md:pb-8">
        <p className="text-xs text-slate-500 mb-2 font-medium">Bibliothèque</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Protocoles de régulation.</h1>
        <p className="text-sm text-slate-400 mb-6">
          {isPremium ? (
            <><strong className="text-white">12 protocoles</strong> disponibles — accès complet</>
          ) : (
            <><strong className="text-white">3 protocoles</strong> disponibles ·{' '}
            <button className="text-periwinkle-400 hover:text-periwinkle-300 underline underline-offset-2 transition-colors">
              Débloquer les 12 en Premium
            </button></>
          )}
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-navy-700 text-white border border-navy-500'
                  : 'text-slate-400 border border-navy-700 hover:text-white hover:bg-navy-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => {
            const locked = p.premium && !isPremium
            return (
              <button
                key={p.id}
                onClick={() => handleClick(p)}
                disabled={locked}
                className={`text-left rounded-xl border p-5 transition-all ${
                  locked
                    ? 'border-navy-700 bg-navy-800/50 opacity-60 cursor-not-allowed'
                    : 'border-navy-700 bg-navy-800 hover:bg-navy-700 hover:border-navy-600 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[p.category] ?? 'text-slate-400 bg-slate-400/10'}`}>
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {locked && <Lock size={11} className="text-amber-400" />}
                    {locked && <span className="text-xs text-amber-400 font-medium">Premium</span>}
                    <span className="text-xs flex items-center gap-1 text-slate-500">
                      <Clock size={11} />{p.duration}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold mb-1.5 text-white">{p.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{locked ? 'Disponible en Premium.' : p.description}</p>
                {!locked && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-periwinkle-400">
                    <Play size={10} />
                    <span>{p.steps.length} étapes guidées</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </main>

      {selectedProtocol && (
        <ProtocolModal
          protocol={selectedProtocol}
          onClose={() => setSelectedProtocol(null)}
        />
      )}
    </>
  )
}
