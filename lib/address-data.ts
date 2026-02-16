export const REGIONS_DISTRICTS: Record<string, string[]> = {
  "Qoraqalpog'iston Respublikasi": [
    "Amudaryo tumani", "Beruniy tumani", "Chimboy tumani", "Ellikqal'a tumani",
    "Kegeyli tumani", "Mo'ynoq tumani", "Nukus tumani", "Qanliko'l tumani",
    "Qo'ng'irot tumani", "Qorao'zak tumani", "Shumanay tumani", "Taxtako'pir tumani",
    "To'rtko'l tumani", "Xo'jayli tumani", "Taxiatosh tumani", "Bo'zatov tumani",
  ],
  "Xorazm viloyati": [
    "Bog'ot tumani", "Gurlan tumani", "Xonqa tumani", "Hazorasp tumani",
    "Xiva tumani", "Qo'shko'pir tumani", "Shovot tumani", "Urganch tumani",
    "Yangiariq tumani", "Yangibozor tumani", "Tuproqqal'a tumani", "Urganch shahri", "Xiva Shahri",
  ],
  "Navoiy viloyati": [
    "Konimex tumani", "Karmana tumani", "Qiziltepa tumani", "Xatirchi tumani",
    "Navbahor tumani", "Nurota tumani", "Tomdi tumani", "Uchquduq tumani",
  ],
  "Buxoro viloyati": [
    "Olot tumani", "Buxoro tumani", "G'ijduvon tumani", "Jondor tumani",
    "Kogon tumani", "Qorako'l tumani", "Qorovulbozor tumani", "Peshku tumani",
    "Romitan tumani", "Shofirkon tumani", "Vobkent tumani",
  ],
  "Samarqand viloyati": [
    "Bulung'ur tumani", "Ishtixon tumani", "Jomboy tumani", "Kattaqo'rg'on tumani",
    "Qo'rabot tumani", "Narpay tumani", "Nurobod tumani", "Oqdaryo tumani",
    "Paxtachi tumani", "Payariq tumani", "Pastdarg'om tumani", "Samarqand tumani",
    "Toyloq tumani", "Urgut tumani",
  ],
  "Qashqadaryo viloyati": [
    "Chiroqchi tumani", "Dehqonobod tumani", "G'uzor tumani", "Qamashi tumani",
    "Qarshi tumani", "Koson tumani", "Kasbi tumani", "Kitob tumani",
    "Mirishkor tumani", "Muborak tumani", "Nishon tumani", "Shahrisabz tumani",
    "Yakkabog' tumani", "Ko'kdala tumani",
  ],
  "Surxondaryo viloyati": [
    "Angor tumani", "Bandixon tumani", "Boysun tumani", "Denov tumani",
    "Jarqo'rg'on tumani", "Qiziriq tumani", "Qumqo'rg'on tumani", "Muzrabot tumani",
    "Oltinsoy tumani", "Sariosiyo tumani", "Sherobod tumani", "Sho'rchi tumani",
    "Termiz tumani", "Uzun tumani",
  ],
  "Jizzax viloyati": [
    "Arnasoy tumani", "Baxmal tumani", "Do'stlik tumani", "Forish tumani",
    "G'allaorol tumani", "Sharof Rashidov tumani", "Mirzacho'l tumani",
    "Paxtakor tumani", "Yangiobod tumani", "Zomin tumani", "Zafarobod tumani",
    "Zarbdor tumani",
  ],
  "Sirdaryo viloyati": [
    "Boyovut tumani", "Guliston tumani", "Mirzaobod tumani", "Oqoltin tumani",
    "Sayxunobod tumani", "Sardoba tumani", "Sirdaryo tumani", "Xovos tumani",
  ],
  "Toshkent viloyati": [
    "Bekobod tumani", "Bo'ka tumani", "Bo'stonliq tumani", "Chinoz tumani",
    "Qibray tumani", "Ohangaron tumani", "Oqqo'rg'on tumani", "Parkent tumani",
    "Piskent tumani", "Quyichirchiq tumani", "O'rta Chirchiq tumani",
    "Yangiyo'l tumani", "Yuqori Chirchiq tumani", "Zangiota tumani",
  ],
  "Namangan viloyati": [
    "Chortoq tumani", "Chust tumani", "Kosonsoy tumani", "Mingbuloq tumani",
    "Namangan tumani", "Norin tumani", "Pop tumani", "To'raqo'rg'on tumani",
    "Uchqo'rg'on tumani", "Uychi tumani", "Yangiqo'rg'on tumani",
  ],
  "Farg'ona viloyati": [
    "Beshariq tumani", "Bog'dod tumani", "Buvayda tumani", "Dang'ara tumani",
    "Farg'ona tumani", "Furqat tumani", "Oltiariq tumani", "Qo'qon tumani",
    "Qo'shtepa tumani", "Rishton tumani", "So'x tumani", "Toshloq tumani",
    "Uchko'prik tumani", "Yozyovon tumani",
  ],
  "Andijon viloyati": [
    "Andijon tumani", "Asaka tumani", "Baliqchi tumani", "Bo'z tumani",
    "Buloqboshi tumani", "Izboskan tumani", "Jalaquduq tumani", "Xo'jaobod tumani",
    "Qo'shrabot tumani", "Marhamat tumani", "Oltinko'l tumani", "Paxtaobod tumani",
    "Shahrixon tumani", "Ulug'nor tumani",
  ],
  "Toshkent shahri": [
    "Bektemir tumani", "Chilonzor tumani", "Yashnobod tumani", "Mirobod tumani",
    "Mirzo-Ulug'bek tumani", "Sergeli tumani", "Shayxontohur tumani", "Olmazar tumani",
    "Uchtepa tumani", "Yakkasaroy tumani", "Yunusobod tumani", "Yashnaobod tumani",
  ],
};

export const REGION_LIST = Object.keys(REGIONS_DISTRICTS);

export function formatAddress(
  country?: string,
  region?: string,
  district?: string,
  street?: string,
): string {
  if (!country) return "";
  if (country !== "uzbekistan") return street || "";
  const parts = [
    "Uzbekistan",
    region || "",
    district || "",
    street || "",
  ].filter(Boolean);
  return parts.join(", ");
}
