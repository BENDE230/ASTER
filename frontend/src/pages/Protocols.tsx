import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Clock, Lock, X, ChevronRight, CheckCircle2, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { usePremium } from '../hooks/usePremium'
import { AnalyticsEvents, track } from '../lib/analytics'
import { OPEN_PROTOCOL_EVENT, consumePendingProtocol } from '../lib/openProtocol'

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
  hasInput?: boolean
  inputPlaceholder?: string
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
        hasInput: true,
        inputPlaceholder: 'La pensée qui revient...',
      },
      {
        title: 'Évalue la preuve',
        instruction: 'Pose-toi cette question : quelles sont les preuves concrètes que cette pensée est vraie ? Et quelles sont les preuves qu\'elle est fausse ou exagérée ? Les deux côtés.',
        duration: '1 min 30',
        hasInput: true,
        inputPlaceholder: 'Preuves pour / preuves contre...',
      },
      {
        title: 'Cherche l\'alternative',
        instruction: 'Si un·e ami·e te disait cette pensée sur lui/elle, que lui répondrais-tu ? Formule une pensée alternative plus équilibrée — pas forcément positive, juste plus réaliste.',
        duration: '1 min',
        hasInput: true,
        inputPlaceholder: 'Une pensée plus juste et réaliste...',
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
        hasInput: true,
        inputPlaceholder: 'Je me sens... J\'ai l\'impression de...',
      },
      {
        title: 'Change de perspective',
        instruction: 'Maintenant, imagine un·e ami·e très proche qui vit exactement ce que tu vis. Que lui écrirais-tu ? Commence la lettre par "Cher·e [ton prénom]," et écris-lui comme à cet ami.',
        duration: '3 min',
        hasInput: true,
        inputPlaceholder: 'Cher·e [ton prénom],',
      },
      {
        title: 'Reconnais l\'effort',
        instruction: 'Termine en reconnaissant quelque chose que tu fais bien, même en ce moment difficile. Même juste : "Tu continues malgré tout. C\'est courageux."',
        duration: '1 min',
        hasInput: true,
        inputPlaceholder: 'Ce que tu fais bien, même là...',
      },
      {
        title: 'Relis à voix basse',
        instruction: 'Relis ce que tu as écrit — lentement, pour toi-même. Laisse les mots entrer. Tu mérites d\'entendre ça.',
        duration: '1 min 30',
      },
    ],
    closing: 'Cette lettre t\'appartient. Garde-la, ou dépose-la. Dans les deux cas, quelque chose en toi a été entendu.',
  },

  // ── Anti-rumination ──────────────────────────────────────────────────────
  {
    id: 'fenetre-inquietude',
    category: 'Anti-rumination',
    duration: '8 min',
    title: 'Fenêtre d\'inquiétude',
    description: 'Confine tes inquiétudes dans un créneau dédié pour libérer le reste de ta journée.',
    premium: true,
    goal: 'Reprendre le contrôle sur les pensées anxieuses en leur donnant un espace défini.',
    when: 'Quand les inquiétudes envahissent ta journée et t\'empêchent d\'être présent·e.',
    steps: [
      {
        title: 'Vide le mental',
        instruction: 'Prends 2 minutes pour noter tout ce qui t\'inquiète en ce moment — sans filtre ni ordre. Chaque pensée mérite d\'être nommée pour être ensuite posée.',
        duration: '2 min',
        hasInput: true,
        inputPlaceholder: 'Tout ce qui tourne dans ta tête...',
      },
      {
        title: 'Trie : contrôlable ou non ?',
        instruction: 'Pour chaque inquiétude : "Est-ce que j\'ai une action concrète à faire là-dessus ?" Si oui, note l\'action. Si non, c\'est une inquiétude sans prise — tu peux la lâcher.',
        duration: '3 min',
        hasInput: true,
        inputPlaceholder: 'Actions concrètes à faire...',
      },
      {
        title: 'Le contrat avec ton esprit',
        instruction: 'Dis intérieurement : "Je t\'entends. Ces inquiétudes ont droit à exister — mais pas toute la journée. Je leur donne 10 minutes chaque soir à [heure précise]." Fixe cette heure.',
        duration: '1 min',
      },
      {
        title: 'Redirige l\'attention',
        instruction: 'Choisis une tâche concrète à faire dans les 10 prochaines minutes. Quelque chose de simple. Commence maintenant — sans optimiser. Juste commencer.',
        duration: '1 min',
      },
      {
        title: 'Ancrage de fin',
        instruction: 'Trois respirations lentes. Rappelle-toi : les inquiétudes auront leur espace ce soir. Ta journée, elle, t\'appartient maintenant.',
        duration: '1 min',
      },
    ],
    closing: 'Les inquiétudes ne disparaissent pas — elles apprennent leur place. Et toi, tu reprends la tienne.',
  },
  {
    id: 'defusion-cognitive',
    category: 'Anti-rumination',
    duration: '5 min',
    title: 'Défusion cognitive',
    description: 'Crée une distance entre toi et tes pensées pour ne plus te laisser emporter.',
    premium: true,
    goal: 'Observer les pensées sans s\'y identifier, réduire leur emprise émotionnelle — technique centrale de la thérapie ACT.',
    when: 'Quand une pensée s\'impose et monopolise ton attention, quand tu te sens "pris·e" dans une histoire mentale.',
    steps: [
      {
        title: 'Nomme la pensée',
        instruction: 'Identifie la pensée qui tourne. Au lieu de penser "Je suis nul·le", reformule : "J\'ai la pensée que je suis nul·le." Cette nuance crée de la distance entre toi et le contenu.',
        duration: '1 min',
      },
      {
        title: 'Merci, le mental',
        instruction: 'Dis intérieurement à la pensée : "Merci, je t\'ai entendue." Sans ironie. Ton cerveau génère des pensées pour te protéger. Les remercier les désamorce sans les combattre.',
        duration: '30 sec',
      },
      {
        title: 'Observe-la flotter',
        instruction: 'Imagine la pensée écrite sur un nuage, une feuille dans une rivière, ou un sous-titre de film. Regarde-la passer. Tu n\'as pas à la retenir ni à la chasser — juste observer.',
        duration: '1 min 30',
      },
      {
        title: 'Reviens ici',
        instruction: 'Pose tes deux pieds au sol. Remarque 2 choses que tu vois en ce moment. Reviens dans le présent — là où la pensée n\'a pas de prise.',
        duration: '1 min',
      },
      {
        title: 'La question utile',
        instruction: 'Demande-toi : "Cette pensée m\'aide-t-elle à agir selon ce qui compte pour moi ?" Si non, tu n\'as pas à l\'écouter. Tu peux la voir passer, et choisir quand même.',
        duration: '1 min',
      },
    ],
    closing: 'Tu n\'es pas tes pensées. Tu es celui/celle qui les observe.',
  },

  // ── Respiration ──────────────────────────────────────────────────────────
  {
    id: 'respiration-carree',
    category: 'Respiration',
    duration: '4 min',
    title: 'Respiration carrée',
    description: 'Quatre temps égaux pour équilibrer le système nerveux et clarifier l\'esprit.',
    premium: false,
    goal: 'Réduire rapidement le stress et améliorer la concentration en équilibrant inspire/rétention/expire.',
    when: 'Avant une situation importante, entre deux tâches, ou quand tu dois retrouver calme et clarté rapidement.',
    steps: [
      {
        title: 'Installe-toi',
        instruction: 'Assieds-toi confortablement, dos droit. Vide tes poumons complètement par la bouche. On va travailler en 4 temps égaux de 4 secondes chacun.',
        duration: '30 sec',
      },
      {
        title: 'Inspire — 4 secondes',
        instruction: 'Inspire par le nez en comptant lentement 1... 2... 3... 4. Sens tes poumons se remplir progressivement, ventre d\'abord, puis poitrine.',
        duration: '4 sec',
      },
      {
        title: 'Retiens — 4 secondes',
        instruction: 'Poumons pleins, retiens doucement en comptant 1... 2... 3... 4. Pas de tension — juste une pause naturelle. Sens la stabilité de cet instant.',
        duration: '4 sec',
      },
      {
        title: 'Expire — 4 secondes',
        instruction: 'Expire lentement par le nez ou la bouche en comptant 1... 2... 3... 4. Laisse le ventre se dégonfler naturellement, sans forcer.',
        duration: '4 sec',
      },
      {
        title: 'Retiens vide — 4 secondes, puis répète',
        instruction: 'Poumons vides, retiens encore 4 secondes avant la prochaine inspire. C\'est un cycle complet. Enchaîne 6 cycles. Cette technique est utilisée par les Navy SEALs pour garder le calme sous pression.',
        duration: '3 min',
      },
    ],
    closing: 'Ce rythme équilibré synchronise ton cerveau et ton corps. Il est maintenant à toi, disponible n\'importe où.',
  },
  {
    id: 'soupir-physiologique',
    category: 'Respiration',
    duration: '3 min',
    title: 'Soupir physiologique',
    description: 'La technique la plus rapide pour baisser le stress — en une seule respiration.',
    premium: true,
    goal: 'Activer immédiatement la réponse de détente par un mécanisme respiratoire naturel et prouvé.',
    when: 'Dès qu\'une montée de stress commence — en réunion, avant de prendre la parole, dans une situation tendue.',
    steps: [
      {
        title: 'Le double inspire',
        instruction: 'Inspire par le nez jusqu\'au bout. Puis prends une courte deuxième inspiration supplémentaire — comme si tu remplissais les tout derniers millimètres de tes poumons. C\'est le "double inspire".',
        duration: '5 sec',
      },
      {
        title: 'L\'expire longue',
        instruction: 'Expire lentement et complètement par la bouche — aussi longtemps que tu peux, jusqu\'au bout. Sens tes épaules descendre, ta mâchoire se relâcher, le diaphragme se libérer.',
        duration: '10 sec',
      },
      {
        title: 'Observe l\'effet',
        instruction: 'Après une seule répétition, remarque ce qui change. Le cœur ralentit. Les épaules descendent. Le ventre se relâche. Juste observer sans analyser.',
        duration: '15 sec',
      },
      {
        title: 'Répète 5 fois',
        instruction: 'Enchaîne 5 soupirs physiologiques. Entre chaque, respire normalement 2 ou 3 fois. Ce n\'est pas un effort — c\'est une libération. Ton corps connaît ce mécanisme depuis ta naissance.',
        duration: '2 min',
      },
    ],
    closing: 'Andrew Huberman et ses équipes à Stanford ont prouvé que c\'est la technique la plus rapide pour réduire le stress en temps réel. Elle t\'appartient maintenant.',
  },

  // ── Retour au corps ──────────────────────────────────────────────────────
  {
    id: 'pendulation',
    category: 'Retour au corps',
    duration: '8 min',
    title: 'Pendulation',
    description: 'Oscille entre une sensation difficile et une ressource pour traverser sans te noyer.',
    premium: true,
    goal: 'Traiter les émotions intenses sans être submergé·e, en utilisant le mouvement naturel du système nerveux.',
    when: 'Quand une émotion forte est présente et que tu veux ne pas en être débordé·e — après un choc, une tension, une peur.',
    steps: [
      {
        title: 'Trouve ta ressource',
        instruction: 'Cherche dans ton corps un endroit qui se sent neutre ou agréable — les mains, les pieds, la chaleur du ventre. Un point de stabilité. Concentre-toi dessus 1 minute complète.',
        duration: '1 min',
      },
      {
        title: 'Touche la sensation difficile',
        instruction: 'Amène doucement ton attention vers là où la tension siège — gorge serrée, poitrine lourde, ventre noué. Reste juste 20 à 30 secondes. Sans te noyer — juste effleurer.',
        duration: '30 sec',
      },
      {
        title: 'Reviens à la ressource',
        instruction: 'Retourne à ton point de stabilité. Reste là 1 minute entière. Sens la différence. Respire. Tu n\'as rien à résoudre — juste osciller.',
        duration: '1 min',
      },
      {
        title: 'Oscille à ton rythme',
        instruction: 'Alterne : sensation difficile (30 sec) → ressource (1 min) → sensation difficile (30 sec) → ressource (1 min). Ton système nerveux apprend que les deux peuvent coexister sans danger.',
        duration: '4 min',
      },
      {
        title: 'Ancrage final',
        instruction: 'Reste dans ta ressource. Pose les deux mains sur tes cuisses. Tu as traversé quelque chose de difficile sans en être écrasé·e. C\'est ça, la régulation.',
        duration: '1 min 30',
      },
    ],
    closing: 'Les émotions ne sont pas des dangers — ce sont des vagues. Et les vagues passent.',
  },
  {
    id: 'yoga-nidra-court',
    category: 'Retour au corps',
    duration: '10 min',
    title: 'Yoga Nidra · éveil doux',
    description: 'Un état entre veille et sommeil pour restaurer le corps et l\'esprit en profondeur.',
    premium: true,
    goal: 'Induire un état de repos profond équivalent à 2 à 4 heures de sommeil, en 12 minutes.',
    when: 'En milieu de journée pour récupérer, après une surcharge, ou quand tu as besoin de te ressourcer vite.',
    steps: [
      {
        title: 'Allonge-toi',
        instruction: 'Allonge-toi sur le dos, bras légèrement écartés, paumes vers le haut. Ferme les yeux. Dis-toi : "Je ne vais pas dormir — je vais me reposer consciemment."',
        duration: '1 min',
      },
      {
        title: 'Rotation de conscience',
        instruction: 'Amène ton attention séquentiellement à chaque partie du corps : main droite... bras droit... épaule droite... côté droit du visage... main gauche... bras gauche... épaule gauche... poitrine... ventre... dos... jambe droite... jambe gauche. Juste noter, sans bouger.',
        duration: '3 min',
      },
      {
        title: 'Les contraires',
        instruction: 'Imagine successivement des sensations opposées : lourdeur... légèreté... chaleur... fraîcheur... joie... tristesse... calme... agitation. Laisse chaque sensation apparaître brièvement, puis passer.',
        duration: '2 min',
      },
      {
        title: 'Visualisation rapide',
        instruction: 'Images qui défilent : ciel bleu... nuage blanc... coucher de soleil... bougie... lac immobile... montagne enneigée... lumière dorée... main qui tient la tienne. Juste laisser défiler, sans s\'accrocher.',
        duration: '2 min',
      },
      {
        title: 'Retour en douceur',
        instruction: 'Reprends conscience de la pièce. Bouge doucement les doigts, les orteils. Étire-toi si tu en as envie. Ouvre les yeux lentement. Reste un moment avant de te lever.',
        duration: '2 min',
      },
    ],
    closing: 'Tu viens de donner à ton système nerveux un repos qu\'il ne peut pas obtenir autrement. Reviens à ta journée — différemment.',
  },

  // ── Hypervigilance ───────────────────────────────────────────────────────
  {
    id: 'lieu-sur-interieur',
    category: 'Hypervigilance',
    duration: '7 min',
    title: 'Lieu sûr intérieur',
    description: 'Crée un refuge mental accessible à tout moment pour calmer le système d\'alarme.',
    premium: true,
    goal: 'Construire une ressource interne de sécurité activable en quelques secondes n\'importe où.',
    when: 'Quand l\'anxiété monte, lors de situations perçues comme menaçantes, ou pour se préparer à un moment difficile.',
    steps: [
      {
        title: 'Ferme les yeux',
        instruction: 'Installe-toi confortablement. Ferme les yeux. Prends trois grandes respirations lentes. Laisse les tensions du monde extérieur se mettre en pause.',
        duration: '1 min',
      },
      {
        title: 'Laisse apparaître ton lieu',
        instruction: 'Laisse venir un endroit — réel ou imaginaire — où tu te sens totalement en sécurité. Plage, forêt, chambre d\'enfance, lieu inventé... Peu importe. C\'est le tien. Ne force pas — laisse-le apparaître.',
        duration: '1 min',
      },
      {
        title: 'Explore par les sens',
        instruction: 'Dans ce lieu : que vois-tu ? Quelles couleurs, quels détails ? Qu\'entends-tu ? Le vent, l\'eau, le silence ? Que ressens-tu physiquement — température, texture sous tes pieds ? Enrichis chaque détail.',
        duration: '2 min',
      },
      {
        title: 'Sens la sécurité dans le corps',
        instruction: 'Remarque ce que la sécurité fait dans ton corps. Tes épaules descendent ? Ta respiration s\'approfondit ? Ton ventre se relâche ? Mémorise cette sensation corporelle — c\'est ton signal.',
        duration: '1 min',
      },
      {
        title: 'Crée ton ancrage',
        instruction: 'Choisis un geste ou un mot pour revenir à ce lieu instantanément — poser la main sur le cœur, presser deux doigts, dire "sécurité". Fais ce geste maintenant, dans ce lieu. Associe-les.',
        duration: '1 min',
      },
      {
        title: 'Retour',
        instruction: 'Ouvre doucement les yeux. Ce lieu t\'appartient. Il sera là à chaque fois que tu feras ton geste ou diras ton mot.',
        duration: '1 min',
      },
    ],
    closing: 'Tu portes maintenant un refuge avec toi. Il ne dépend de rien ni de personne.',
  },
  {
    id: 'toning-vagal',
    category: 'Hypervigilance',
    duration: '5 min',
    title: 'Toning vagal',
    description: 'Utilise la voix et le mouvement pour activer le nerf vague et sortir du mode survie.',
    premium: true,
    goal: 'Stimuler directement le système nerveux parasympathique via des vibrations vocales — technique neurosomatic.',
    when: 'Quand tu es en état de vigilance élevée, après une grande peur, ou pour ancrer un sentiment de sécurité rapidement.',
    steps: [
      {
        title: 'Humming doux',
        instruction: 'Inspire par le nez. En expirant, produis un son "mmmmm" doux et continu — bouche fermée, lèvres légèrement jointes. Sens la vibration dans ta poitrine et ton crâne. Répète 5 fois.',
        duration: '1 min 30',
      },
      {
        title: 'Son "voo"',
        instruction: 'Inspire profondément. En expirant, produis un "voooooo" grave et long, comme une corne de brume. Sens la vibration descendre dans ton ventre. Ce son cible directement le nerf vague. Répète 4 fois.',
        duration: '1 min 30',
      },
      {
        title: 'Étirement du cou',
        instruction: 'Doucement, tourne la tête à gauche — maintiens 10 secondes. Puis à droite, 10 secondes. Ce mouvement active les récepteurs du nerf vague dans les muscles du cou.',
        duration: '1 min',
      },
      {
        title: 'Le soupir final',
        instruction: 'Un dernier grand soupir physiologique — double inspire par le nez, longue expiration sonore par la bouche. Sens tout se relâcher.',
        duration: '30 sec',
      },
    ],
    closing: 'Le nerf vague est ton frein naturel sur le système nerveux. Tu viens d\'appuyer dessus.',
  },

  // ── Sommeil ──────────────────────────────────────────────────────────────
  {
    id: 'repos-profond-nsdr',
    category: 'Sommeil',
    duration: '15 min',
    title: 'Repos profond · NSDR',
    description: 'Non-Sleep Deep Rest : récupère l\'équivalent d\'une nuit partielle sans dormir.',
    premium: true,
    goal: 'Restaurer l\'énergie, la dopamine et la concentration — prouvé par les neurosciences de Stanford.',
    when: 'En milieu d\'après-midi, après une nuit courte, ou quand tu manques d\'énergie sans pouvoir dormir.',
    steps: [
      {
        title: 'Installe-toi complètement',
        instruction: 'Allonge-toi, bras légèrement écartés, paumes vers le haut. Couvre-toi si besoin. Masque de sommeil si tu en as un. L\'objectif : ne rien faire pendant 15 minutes. Vraiment rien.',
        duration: '1 min',
      },
      {
        title: 'Lâche le contrôle',
        instruction: 'Tu n\'as pas à t\'endormir. Tu n\'as pas à bien faire. Tu n\'as pas à vider ton esprit. Si des pensées arrivent, laisse-les passer. Ton seul travail : rester allongé·e et éveillé·e.',
        duration: '2 min',
      },
      {
        title: 'Respiration détendue',
        instruction: 'Laisse ta respiration devenir lente et naturelle — pas de rythme imposé. Observe juste le mouvement de ton ventre qui monte et descend. Sens ton corps s\'alourdir progressivement.',
        duration: '3 min',
      },
      {
        title: 'Immobilité consciente',
        instruction: 'Reste parfaitement immobile. Cette immobilité intentionnelle — pas de sommeil, pas d\'agitation — est ce qui crée l\'état NSDR. Ton cerveau se réinitialise pendant que tu restes conscient·e.',
        duration: '7 min',
      },
      {
        title: 'Retour',
        instruction: 'Commence à bouger lentement — doigts, orteils, puis un étirement doux. Assieds-toi progressivement. Attends 1 minute avant de te lever.',
        duration: '2 min',
      },
    ],
    closing: 'Cet état améliore la mémoire, la créativité et la régulation émotionnelle pour les heures qui suivent. Ton cerveau vient de se recharger.',
  },

  // ── Sécurité émotionnelle ────────────────────────────────────────────────
  {
    id: 'clarification-valeurs',
    category: 'Sécurité émotionnelle',
    duration: '10 min',
    title: 'Clarification des valeurs',
    description: 'Reconnecte-toi à ce qui compte vraiment quand tu te sens perdu·e ou à la dérive.',
    premium: true,
    goal: 'Identifier tes valeurs profondes pour retrouver une boussole intérieure face au doute ou à l\'incertitude.',
    when: 'Quand tu doutes de tes choix, que tu te sens à la dérive, ou que tu manques de sens dans ce que tu fais.',
    steps: [
      {
        title: 'Les moments qui comptent',
        instruction: 'Pense à 3 moments de ta vie où tu t\'es senti·e vraiment vivant·e, dans ton élément, fier·e ou en paix. Pas forcément des grands événements — parfois c\'est une conversation, un projet, un service rendu.',
        duration: '2 min',
        hasInput: true,
        inputPlaceholder: '1. ...\n2. ...\n3. ...',
      },
      {
        title: 'Qu\'est-ce qui était présent ?',
        instruction: 'Pour chacun de ces moments : qu\'est-ce qui le rendait précieux ? La liberté ? La connexion ? La création ? L\'utilité aux autres ? La vérité ? Note les mots qui viennent naturellement.',
        duration: '3 min',
        hasInput: true,
        inputPlaceholder: 'Les mots qui viennent...',
      },
      {
        title: 'Tes 3 valeurs clés',
        instruction: 'Parmi les mots notés, lesquels reviennent ? Lesquels font monter quelque chose dans ton ventre ? Choisis 3 valeurs essentielles. Pas celles que tu devrais avoir — celles qui sont vraiment là.',
        duration: '2 min',
        hasInput: true,
        inputPlaceholder: 'Mes 3 valeurs : ...',
      },
      {
        title: 'Le test de vie',
        instruction: 'Regarde ta situation actuelle à travers ces 3 valeurs. Y a-t-il alignement ? Où est-ce que tu vis selon elles ? Où t\'en éloignes-tu ? Juste observer, sans jugement.',
        duration: '2 min',
      },
      {
        title: 'Une action alignée',
        instruction: 'Y a-t-il une seule petite chose que tu pourrais faire cette semaine qui honore l\'une de ces valeurs ? Une chose concrète, réalisable. Note-la ou retiens-la.',
        duration: '1 min',
        hasInput: true,
        inputPlaceholder: 'Cette semaine, je vais...',
      },
    ],
    closing: 'Tes valeurs ne disparaissent pas — elles attendent que tu les réécoutes.',
  },
  {
    id: 'ancrage-emotion',
    category: 'Sécurité émotionnelle',
    duration: '5 min',
    title: 'Accueillir l\'émotion',
    description: 'Arrête de fuir ce que tu ressens — apprends à l\'accueillir pour le traverser plus vite.',
    premium: true,
    goal: 'Réduire la durée et l\'intensité des émotions difficiles en les accueillant plutôt qu\'en les évitant.',
    when: 'Quand une émotion désagréable monte et que tu as envie de la fuir, la noyer ou la faire taire.',
    steps: [
      {
        title: 'Nomme ce que tu ressens',
        instruction: 'Pose une main sur ta poitrine ou ton ventre. Dis intérieurement : "En ce moment, je ressens..." et laisse le mot venir. Tristesse, honte, colère, peur, vide... Juste nommer réduit déjà l\'intensité.',
        duration: '1 min',
      },
      {
        title: 'Localise dans le corps',
        instruction: 'Où cette émotion siège-t-elle exactement ? Gorge, poitrine, ventre, épaules ? Quelle texture — serrée, lourde, brûlante, creuse ? Décris-la comme si tu la voyais pour la première fois.',
        duration: '1 min',
      },
      {
        title: 'Respire dedans',
        instruction: 'Dirige ta respiration vers cet endroit. Inspire en imaginant que tu envoies de l\'espace et de la douceur là-dedans. Expire en relâchant sans forcer. Pas pour faire partir l\'émotion — pour lui faire de la place.',
        duration: '1 min 30',
      },
      {
        title: 'Dis-lui oui',
        instruction: 'Dis intérieurement à l\'émotion : "Tu as le droit d\'être là. Je ne te chasse pas." Cette permission paradoxale est ce qui permet aux émotions de bouger. Ce qu\'on accueille se dissout — ce qu\'on combat reste.',
        duration: '1 min',
      },
      {
        title: 'Observe le changement',
        instruction: 'Remarque si quelque chose a bougé — même légèrement. L\'émotion est-elle toujours là ? A-t-elle changé de texture, d\'intensité ? Reste dans cet espace encore quelques respirations.',
        duration: '30 sec',
      },
    ],
    closing: 'Les émotions durent en moyenne 90 secondes quand on les accueille vraiment. C\'est la résistance qui les prolonge.',
  },
  {
    id: 'dialogue-parties',
    category: 'Sécurité émotionnelle',
    duration: '8 min',
    title: 'Dialogue avec tes parties',
    description: 'Parle à la partie de toi qui a peur ou qui résiste pour entendre ce qu\'elle vit vraiment.',
    premium: true,
    goal: 'Réduire les conflits internes en établissant un dialogue bienveillant avec les différentes voix intérieures — inspiré de l\'IFS.',
    when: 'Quand tu te sens divisé·e, quand une partie de toi résiste fortement, ou quand tu te sabotes sans comprendre pourquoi.',
    steps: [
      {
        title: 'Identifie la partie',
        instruction: 'Quelle voix intérieure prend de la place en ce moment ? Le critique intérieur ? La partie qui veut fuir ? Celle qui a honte ? Nomme-la simplement : "la partie critique", "la partie peureuse".',
        duration: '1 min',
      },
      {
        title: 'Donne-lui de l\'espace',
        instruction: 'Au lieu de la combattre, tourne-toi vers elle. Dis intérieurement : "Je t\'entends. Tu es là. Tu peux parler." Qu\'est-ce qu\'elle exprime vraiment sous la surface ?',
        duration: '2 min',
      },
      {
        title: 'Cherche son intention positive',
        instruction: 'Pose-lui cette question : "Qu\'est-ce que tu essaies de me protéger ou de m\'apporter ?" Même les parties difficiles ont une intention positive. La critique essaie peut-être de te protéger du rejet.',
        duration: '2 min',
      },
      {
        title: 'Remercie et rassure',
        instruction: 'Remercie cette partie pour son effort — elle fait de son mieux. Puis dis-lui : "Tu n\'as pas à porter ça seule. Je suis là. On peut gérer ça ensemble."',
        duration: '2 min',
      },
      {
        title: 'Retour au centre',
        instruction: 'Sens ton "moi observateur" — la partie de toi qui n\'est ni le critique, ni la peur, ni la honte. Juste l\'espace de conscience calme. Reste là quelques respirations.',
        duration: '1 min',
      },
    ],
    closing: 'Tu n\'es pas tes conflits intérieurs. Tu es le terrain sur lequel ils jouent.',
  },
]

function useSpeech() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    window.speechSynthesis.cancel()
  }, [])

  const speak = useCallback((text: string) => {
    // Cancel any current/pending speech, then wait —
    // Chrome often drops speak() if called immediately after cancel().
    stop()
    timerRef.current = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      utterance.rate = 0.88
      utterance.pitch = 1
      utterance.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const frVoice =
        voices.find(v => v.lang.startsWith('fr') && v.localService) ??
        voices.find(v => v.lang.startsWith('fr'))
      if (frVoice) utterance.voice = frVoice
      window.speechSynthesis.speak(utterance)
      // Chrome can leave the synth paused after cancel
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    }, 150)
  }, [stop])

  const toggle = useCallback(() => {
    setVoiceEnabled(v => {
      if (v) stop()
      return !v
    })
  }, [stop])

  // Prefetch voices (async on Chrome)
  useEffect(() => {
    window.speechSynthesis.getVoices()
    const onVoices = () => window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener('voiceschanged', onVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
      stop()
    }
  }, [stop])

  return { voiceEnabled, speak, stop, toggle }
}

function CompletionScreen({ closing, onClose, voiceEnabled, speak }: {
  closing: string
  onClose: () => void
  voiceEnabled: boolean
  speak: (text: string) => void
}) {
  useEffect(() => {
    if (voiceEnabled) speak(`Protocole terminé. ${closing}`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-6 py-8 text-center overflow-y-auto">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={26} className="text-emerald-400" />
      </div>
      <p className="text-white font-semibold text-lg mb-3">Protocole terminé</p>
      <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">"{closing}"</p>
      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white text-sm font-semibold transition-colors"
      >
        Terminer
      </button>
    </div>
  )
}

function ProtocolModal({ protocol, onClose }: { protocol: Protocol; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [running, setRunning] = useState(false)
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({})
  const { voiceEnabled, speak, stop, toggle } = useSpeech()

  const step = protocol.steps[currentStep]
  const isLast = currentStep === protocol.steps.length - 1

  // When user turns voice ON mid-protocol, read the current step
  useEffect(() => {
    if (voiceEnabled && running && !completed && step) {
      speak(step.instruction)
    }
    // intentionally only when voiceEnabled flips on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled])

  const next = () => {
    if (isLast) {
      stop()
      setCompleted(true)
      return
    }
    const nextIdx = currentStep + 1
    const nextInstruction = protocol.steps[nextIdx]?.instruction
    setCurrentStep(nextIdx)
    if (voiceEnabled && nextInstruction) {
      speak(nextInstruction)
    }
  }

  const goBack = () => {
    const prevIdx = currentStep - 1
    setCurrentStep(prevIdx)
    setRunning(true)
    if (voiceEnabled) {
      speak(protocol.steps[prevIdx].instruction)
    }
  }

  const start = () => {
    setRunning(true)
    if (voiceEnabled) {
      speak(protocol.steps[0].instruction)
    }
  }

  const tagColor = TAG_COLORS[protocol.category] ?? 'text-slate-400 bg-slate-400/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
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
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={toggle}
              title={voiceEnabled ? 'Désactiver la voix' : 'Activer la voix guidée'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                voiceEnabled
                  ? 'bg-periwinkle-500/20 text-periwinkle-400 border border-periwinkle-500/40'
                  : 'text-slate-500 hover:text-slate-300 border border-navy-600 hover:bg-navy-800'
              }`}
            >
              {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="hidden sm:inline">{voiceEnabled ? 'Voix on' : 'Voix'}</span>
            </button>
            <button onClick={() => { stop(); onClose() }} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {completed ? (
          /* Completion screen */
          <CompletionScreen
            closing={protocol.closing}
            onClose={() => { stop(); onClose() }}
            voiceEnabled={voiceEnabled}
            speak={speak}
          />
        ) : (
          <>
            {/* Intro (step 0 not started) or Step view */}
            {currentStep === 0 && !running ? (
              <div className="px-6 py-5 overflow-y-auto">
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
                  onClick={start}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-400 text-white font-semibold text-sm transition-colors"
                >
                  <Play size={14} />
                  Commencer le protocole
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 overflow-y-auto">
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

                <div className="rounded-xl bg-navy-800 border border-navy-700 px-4 py-4 mb-3">
                  <p className="text-sm text-slate-300 leading-relaxed">{step.instruction}</p>
                  <button
                    onClick={() => speak(step.instruction)}
                    title="Lire à voix haute"
                    className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
                      voiceEnabled ? 'text-periwinkle-400 hover:text-periwinkle-300' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Volume2 size={12} />
                    {voiceEnabled ? 'Relire' : 'Lire'}
                  </button>
                </div>

                {step.hasInput && (
                  <textarea
                    value={stepNotes[currentStep] ?? ''}
                    onChange={e => setStepNotes(prev => ({ ...prev, [currentStep]: e.target.value }))}
                    placeholder={step.inputPlaceholder ?? 'Écris ici...'}
                    rows={4}
                    className="w-full mb-3 rounded-xl bg-navy-900 border border-navy-600 focus:border-periwinkle-500 focus:outline-none px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 resize-none transition-colors"
                  />
                )}

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={goBack}
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
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null)
  const isPremium = usePremium()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const tryOpen = useCallback((openId: string | null) => {
    if (!openId) return
    const protocol = PROTOCOLS.find(p => p.id === openId)
    if (protocol && (!protocol.premium || isPremium)) {
      setSelectedProtocol(protocol)
      track(AnalyticsEvents.PROTOCOL_OPENED, {
        protocol_id: protocol.id,
        title: protocol.title,
        category: protocol.category,
        premium: protocol.premium,
        source: 'deep_link',
      })
    }
  }, [isPremium])

  // When /protocols becomes active: open from sessionStorage, event, or ?open=
  useEffect(() => {
    if (location.pathname !== '/protocols') return
    const pending = consumePendingProtocol()
    tryOpen(pending ?? searchParams.get('open'))
  }, [location.pathname, location.search, tryOpen, searchParams])

  // Direct open while Protocols is already mounted (keep-alive)
  useEffect(() => {
    const handler = (e: Event) => {
      tryOpen((e as CustomEvent<string>).detail)
    }
    window.addEventListener(OPEN_PROTOCOL_EVENT, handler)
    return () => window.removeEventListener(OPEN_PROTOCOL_EVENT, handler)
  }, [tryOpen])

  const allFiltered = activeCategory === 'Tous'
    ? PROTOCOLS
    : PROTOCOLS.filter(p => p.category === activeCategory)

  const freeProtocols = allFiltered.filter(p => !p.premium)
  const premiumProtocols = allFiltered.filter(p => p.premium)

  const handleClick = (p: Protocol) => {
    if (p.premium && !isPremium) return
    track(AnalyticsEvents.PROTOCOL_OPENED, {
      protocol_id: p.id,
      title: p.title,
      category: p.category,
      premium: p.premium,
    })
    setSelectedProtocol(p)
  }

  return (
    <>
      <main className="md:ml-[210px] flex-1 px-4 md:px-8 py-6 md:py-8 max-w-3xl pb-24 md:pb-8">
        <p className="text-xs text-slate-500 mb-2 font-medium">Bibliothèque</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Protocoles de régulation.</h1>
        <p className="text-sm text-slate-400 mb-6">
          {isPremium ? (
            <><strong className="text-white">{PROTOCOLS.length} protocoles</strong> disponibles — accès complet</>
          ) : (
            <><strong className="text-white">{PROTOCOLS.filter(p => !p.premium).length} protocoles</strong> disponibles ·{' '}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-periwinkle-400 hover:text-periwinkle-300 underline underline-offset-2 transition-colors"
            >
              Débloquer les {PROTOCOLS.filter(p => p.premium).length} en Premium
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

        {/* Free protocols */}
        {freeProtocols.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Accès libre
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {freeProtocols.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleClick(p)}
                  className="text-left rounded-xl border border-navy-700 bg-navy-800 hover:bg-navy-700 hover:border-navy-600 cursor-pointer p-5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[p.category] ?? 'text-slate-400 bg-slate-400/10'}`}>
                      {p.category}
                    </span>
                    <span className="text-xs flex items-center gap-1 text-slate-500">
                      <Clock size={11} />{p.duration}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1.5 text-white">{p.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-periwinkle-400">
                    <Play size={10} />
                    <span>{p.steps.length} étapes guidées</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Premium protocols */}
        {premiumProtocols.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Premium · {premiumProtocols.length} protocoles
              </p>
              {!isPremium && (
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-xs text-periwinkle-400 hover:text-periwinkle-300 underline underline-offset-2 transition-colors"
                >
                  Débloquer
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {premiumProtocols.map(p => {
                const locked = !isPremium
                return (
                  <button
                    key={p.id}
                    onClick={() => locked ? navigate('/profile') : handleClick(p)}
                    className={`text-left rounded-xl border p-5 transition-all ${
                      locked
                        ? 'border-amber-500/20 bg-navy-800/50 cursor-pointer hover:border-amber-500/40 hover:bg-navy-800'
                        : 'border-navy-700 bg-navy-800 hover:bg-navy-700 hover:border-navy-600 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[p.category] ?? 'text-slate-400 bg-slate-400/10'} ${locked ? 'opacity-50' : ''}`}>
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {locked
                          ? <><Lock size={11} className="text-amber-400" /><span className="text-xs text-amber-400 font-medium">Premium</span></>
                          : <span className="text-xs flex items-center gap-1 text-slate-500"><Clock size={11} />{p.duration}</span>
                        }
                      </div>
                    </div>
                    <p className={`text-sm font-semibold mb-1.5 ${locked ? 'text-slate-400' : 'text-white'}`}>{p.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {locked ? p.description : p.description}
                    </p>
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
          </>
        )}
      </main>

      {selectedProtocol && (
        <ProtocolModal
          protocol={selectedProtocol}
          onClose={() => {
            setSelectedProtocol(null)
            if (searchParams.get('open')) {
              navigate('/protocols', { replace: true })
            }
          }}
        />
      )}
    </>
  )
}
