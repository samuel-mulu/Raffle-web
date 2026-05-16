import { Campaign } from '@/types/api';
import { AppLanguage } from '@/stores/language-store';

type TranslationKey =
  | 'almostFull'
  | 'aboutPrize'
  | 'backToCampaigns'
  | 'buyTicket'
  | 'connectionError'
  | 'drawDate'
  | 'entry'
  | 'explore'
  | 'filled'
  | 'howItWorks'
  | 'loading'
  | 'loadingCampaigns'
  | 'noActiveDrops'
  | 'noPreview'
  | 'openCampaign'
  | 'premiumCreator'
  | 'raffleNotFound'
  | 'raffleProgress'
  | 'signIn'
  | 'sponsored'
  | 'stayTuned'
  | 'ticketPrice'
  | 'ticketsLeft'
  | 'verifiedCreator';

const labels: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    almostFull: 'Almost Full',
    aboutPrize: 'About Prize',
    backToCampaigns: 'Back to campaigns',
    buyTicket: 'Buy Ticket',
    connectionError: 'Connection Error',
    drawDate: 'Draw Date',
    entry: 'Entry',
    explore: 'Explore',
    filled: 'Filled',
    howItWorks: 'How it works',
    loading: 'Loading...',
    loadingCampaigns: 'Loading campaigns...',
    noActiveDrops: 'No active drops',
    noPreview: 'No Preview Available',
    openCampaign: 'Open Campaign',
    premiumCreator: 'Premium Creator',
    raffleNotFound: 'Raffle not found',
    raffleProgress: 'Raffle Progress',
    signIn: 'Sign In',
    sponsored: 'Sponsored',
    stayTuned: 'Stay tuned for the next premium raffle campaign.',
    ticketPrice: 'Ticket Price',
    ticketsLeft: 'Tickets Left',
    verifiedCreator: 'Verified Creator',
  },
  am: {
    almostFull: 'ሊሞላ ነው',
    aboutPrize: 'ስለ ሽልማቱ',
    backToCampaigns: 'ወደ ዘመቻዎች ተመለስ',
    buyTicket: 'ትኬት ይግዙ',
    connectionError: 'የግንኙነት ችግር',
    drawDate: 'የዕጣ ቀን',
    entry: 'መግቢያ',
    explore: 'ይመልከቱ',
    filled: 'ተሞልቷል',
    howItWorks: 'እንዴት ይሰራል',
    loading: 'በመጫን ላይ...',
    loadingCampaigns: 'ዘመቻዎች በመጫን ላይ...',
    noActiveDrops: 'ንቁ ዕጣዎች የሉም',
    noPreview: 'ቅድመ እይታ የለም',
    openCampaign: 'ክፍት ዘመቻ',
    premiumCreator: 'ፕሪሚየም ፈጣሪ',
    raffleNotFound: 'ዕጣው አልተገኘም',
    raffleProgress: 'የዕጣ እድገት',
    signIn: 'ግባ',
    sponsored: 'የተደገፈ',
    stayTuned: 'ቀጣዩን ፕሪሚየም የዕጣ ዘመቻ ይጠብቁ።',
    ticketPrice: 'የትኬት ዋጋ',
    ticketsLeft: 'የቀሩ ትኬቶች',
    verifiedCreator: 'የተረጋገጠ ፈጣሪ',
  },
  ti: {
    almostFull: 'ክመልእ ቀሪቡ',
    aboutPrize: 'ብዛዕባ ሽልማት',
    backToCampaigns: 'ናብ ዘመቻታት ተመለስ',
    buyTicket: 'ቲኬት ዓድግ',
    connectionError: 'ጸገም ርክብ',
    drawDate: 'ዕለት ዕጫ',
    entry: 'መእተዊ',
    explore: 'ዳህስስ',
    filled: 'ተመሊኡ',
    howItWorks: 'ከመይ ይሰርሕ',
    loading: 'ይጽዓን ኣሎ...',
    loadingCampaigns: 'ዘመቻታት ይጽዓኑ ኣለዉ...',
    noActiveDrops: 'ንጡፍ ዕጫታት የለን',
    noPreview: 'ቅድመ ርእይቶ የለን',
    openCampaign: 'ክፉት ዘመቻ',
    premiumCreator: 'ፕሪሚየም ፈጣሪ',
    raffleNotFound: 'ዕጫ ኣይተረኽበን',
    raffleProgress: 'ምዕባለ ዕጫ',
    signIn: 'እቶ',
    sponsored: 'ዝተደገፈ',
    stayTuned: 'ንቀጻሊ ፕሪሚየም ዕጫ ዘመቻ ተጸበዩ።',
    ticketPrice: 'ዋጋ ቲኬት',
    ticketsLeft: 'ዝተረፉ ቲኬታት',
    verifiedCreator: 'ዝተረጋገጸ ፈጣሪ',
  },
};

const campaignTranslations: Record<
  string,
  Partial<Record<AppLanguage, { title: string; description?: string }>>
> = {
  'Samsung 65-inch 4K TV Giveaway': {
    am: {
      title: 'ሳምሰንግ 65 ኢንች 4K ቲቪ ዕጣ',
      description:
        'ለቤት መዝናኛ የተዘጋጀ የሳምሰንግ 65 ኢንች 4K ቲቪ ዕጣ።',
    },
    ti: {
      title: 'ሳምሰንግ 65 ኢንች 4K ቲቪ ዕጫ',
      description: 'ንመዘናግዒ ገዛ ዝተዳለወ ሳምሰንግ 65 ኢንች 4K ቲቪ ዕጫ።',
    },
  },
  'Isuzu D-Max Pickup Raffle': {
    am: {
      title: 'ኢሱዙ D-Max ፒካፕ ዕጣ',
      description:
        'ከፍተኛ ዋጋ ያለው የኢሱዙ D-Max ፒካፕ መኪና ዕጣ።',
    },
    ti: {
      title: 'ኢሱዙ D-Max ፒካፕ ዕጫ',
      description: 'ልዑል ዋጋ ዘለዎ ናይ ኢሱዙ D-Max ፒካፕ መኪና ዕጫ።',
    },
  },
  'Luxury Apartment Raffle': {
    am: {
      title: 'የቅንጦት አፓርታማ ዕጣ',
      description: 'በብዙ ተሳታፊዎች የተዘጋጀ የቅንጦት አፓርታማ ዕጣ።',
    },
    ti: {
      title: 'ሉክስ ኣፓርታማ ዕጫ',
      description: 'ብብዙሓት ተሳተፍቲ ዝተዳለወ ሉክስ ኣፓርታማ ዕጫ።',
    },
  },
  'Brand New Toyota Land Cruiser': {
    am: {
      title: 'አዲስ ቶዮታ ላንድ ክሩዘር',
      description: 'አዲስ ቶዮታ ላንድ ክሩዘር ለማሸነፍ የተዘጋጀ ዕጣ።',
    },
    ti: {
      title: 'ሓድሽ ቶዮታ ላንድ ክሩዘር',
      description: 'ሓድሽ ቶዮታ ላንድ ክሩዘር ንምዕዋት ዝተዳለወ ዕጫ።',
    },
  },
  'iPhone 15 Pro Max Bundle': {
    am: {
      title: 'iPhone 15 Pro Max ጥቅል',
      description: 'ለዕጣ የተዘጋጀ የiPhone 15 Pro Max ጥቅል።',
    },
    ti: {
      title: 'iPhone 15 Pro Max ፓኬጅ',
      description: 'ንዕጫ ዝተዳለወ iPhone 15 Pro Max ፓኬጅ።',
    },
  },
  'PlayStation 5 Gaming Pack': {
    am: {
      title: 'PlayStation 5 የጨዋታ ጥቅል',
      description: 'PS5፣ ተጨማሪ መቆጣጠሪያ እና የጨዋታ ቫውቸር ያለው ዕጣ።',
    },
    ti: {
      title: 'PlayStation 5 ጌሚንግ ፓኬጅ',
      description: 'PS5፣ ተወሳኺ መቆጻጸሪን ናይ ጸወታ ቫውቸርን ዘለዎ ዕጫ።',
    },
  },
  'Smart Home Appliance Bundle': {
    am: {
      title: 'የስማርት ቤት እቃዎች ጥቅል',
      description: 'ፍሪጅ፣ ማጠቢያ ማሽን፣ ማይክሮዌቭ እና ብሌንደር ያካተተ ዕጣ።',
    },
    ti: {
      title: 'ስማርት ናይ ገዛ መሳርሒ ፓኬጅ',
      description: 'ፍሪጅ፣ ማሽን ሕጻብ፣ ማይክሮዌቭን ብሌንደርን ዘካተተ ዕጫ።',
    },
  },
};

export function t(language: AppLanguage, key: TranslationKey) {
  return labels[language][key] ?? labels.en[key];
}

export function getCampaignText(campaign: Campaign, language: AppLanguage) {
  const translated = campaignTranslations[campaign.title]?.[language];

  return {
    title: translated?.title ?? campaign.title,
    description: translated?.description ?? campaign.description,
  };
}
