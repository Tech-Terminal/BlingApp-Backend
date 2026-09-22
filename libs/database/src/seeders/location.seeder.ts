import { DataSource } from 'typeorm';
import { Governorate, Area } from '@libs/index';

export const KUWAIT_LOCATIONS_DATA = [
  {
    governorate: { nameEn: 'Ahmadi', nameAr: 'الأحمدي' },
    areas: [
      { nameEn: 'Abu Halifa', nameAr: 'أبو حليفة' },
      { nameEn: 'Al Daher', nameAr: 'الضهر' },
      { nameEn: 'Al Dubaiya', nameAr: 'الضباعية' },
      { nameEn: 'Al-Ahmadi', nameAr: 'الأحمدي' },
      { nameEn: 'Al-Maqwa', nameAr: 'المقوع' },
      { nameEn: 'Ali Subah Al-Salem', nameAr: 'علي صباح السالم' },
      { nameEn: 'East Ahmadi', nameAr: 'شرق الأحمدي' },
      { nameEn: 'Eqaila', nameAr: 'العقيلة' },
      { nameEn: 'Fahad Al-Ahmad', nameAr: 'فهد الأحمد' },
      { nameEn: 'Fahaheel', nameAr: 'الفحيحيل' },
      { nameEn: 'Fintas', nameAr: 'الفنطاس' },
      { nameEn: 'Hadiya', nameAr: 'هدية' },
      { nameEn: 'Jaber Al Ali', nameAr: 'جابر العلي' },
      { nameEn: 'Julaia', nameAr: 'الجليعة' },
      { nameEn: 'Khairan', nameAr: 'الخيران' },
      { nameEn: 'Magwa', nameAr: 'المقوع' },
      { nameEn: 'Mahboula', nameAr: 'المهبولة' },
      { nameEn: 'Mangaf', nameAr: 'المنقف' },
      { nameEn: 'Middle of Ahmadi', nameAr: 'وسط الأحمدي' },
      { nameEn: 'mina abdulla', nameAr: 'ميناء عبدالله' },
      { nameEn: 'Mina Al-Ahmadi Refinery', nameAr: 'مصفاة ميناء الأحمدي' },
      { nameEn: 'North Ahmadi', nameAr: 'شمال الأحمدي' },
      { nameEn: 'Port of Shuaiba', nameAr: 'ميناء الشعيبة' },
      { nameEn: 'Riqqah', nameAr: 'الرقة' },
      { nameEn: 'Sabah Al Ahmad Sea City', nameAr: 'مدينة صباح الأحمد البحرية' },
      { nameEn: 'Sabah Al Ahmed Natural Reserve', nameAr: 'محمية صباح الأحمد الطبيعية' },
      { nameEn: 'Sabah Al Ahmed Residencial', nameAr: 'مدينة صباح الأحمد السكنية' },
      { nameEn: 'Sabah Al-Ahmad', nameAr: 'صباح الأحمد' },
      { nameEn: 'Sabah Al-Ahmad 2', nameAr: 'صباح الأحمد 2' },
      { nameEn: 'Sabah Al-Ahmad 3', nameAr: 'صباح الأحمد 3' },
      { nameEn: 'Sabah Al-Ahmad 4', nameAr: 'صباح الأحمد 4' },
      { nameEn: 'Sabah Al-Ahmad 5', nameAr: 'صباح الأحمد 5' },
      { nameEn: 'Sabah Al-Ahmad Al-marine', nameAr: 'صباح الأحمد البحرية' },
      { nameEn: 'Sabah Al-Ahmad Investment', nameAr: 'صباح الأحمد الاستثمارية' },
      { nameEn: 'Sabah Al-Ahmad Services', nameAr: 'صباح الأحمد الخدمية' },
      { nameEn: 'Shalayhat Al Dubaiya', nameAr: 'شاليهات الضباعية' },
      { nameEn: 'Shalehat Bneder', nameAr: 'شاليهات بنيدر' },
      { nameEn: 'Shalehat Dba\'ayeh', nameAr: 'شاليهات الضباعية' },
      { nameEn: 'Shalehat Mina Abdullah', nameAr: 'شاليهات ميناء عبدالله' },
      { nameEn: 'Shuaiba Industrial esterly', nameAr: 'الشعيبة الصناعية الشرقية' },
      { nameEn: 'Shuaiba Industrial Western', nameAr: 'الشعيبة الصناعية الغربية' },
      { nameEn: 'South Ahmadi', nameAr: 'جنوب الأحمدي' },
      { nameEn: 'South-Sabahiya', nameAr: 'جنوب الصباحية' },
      { nameEn: 'Subahiya', nameAr: 'الصباحية' },
      { nameEn: 'Um AlHayman', nameAr: 'أم الهيمان (علي صباح السالم)' },
      { nameEn: 'Wafra', nameAr: 'الوفرة' },
      { nameEn: 'Wafra Farms', nameAr: 'مزارع الوفرة' },
    ],
  },
  {
    governorate: { nameEn: 'Mubarak Al-Kabeer', nameAr: 'مبارك الكبير' },
    areas: [
      { nameEn: 'Abu Fatira', nameAr: 'أبو فطيرة' },
      { nameEn: 'Abu Hasaniya', nameAr: 'أبو الحصانية' },
      { nameEn: 'Airport', nameAr: 'المطار' },
      { nameEn: 'Al-Adan', nameAr: 'العدان' },
      { nameEn: 'Al-Masayel', nameAr: 'المسايل' },
      { nameEn: 'Fnaitees', nameAr: 'الفنيطيس' },
      { nameEn: 'Messila', nameAr: 'المسيلة' },
      { nameEn: 'Mubarak Al Kabeer', nameAr: 'مبارك الكبير' },
      { nameEn: 'Qosour', nameAr: 'القصور' },
      { nameEn: 'Qurain', nameAr: 'القرين' },
      { nameEn: 'Sabah Al Salem', nameAr: 'صباح السالم' },
      { nameEn: 'Sabhan', nameAr: 'صبحان' },
      { nameEn: 'Sabhan Industrial Area', nameAr: 'منطقة صبحان الصناعية' },
      { nameEn: 'South Wista', nameAr: 'جنوب الوسطى' },
      { nameEn: 'West Abu Ftirah Hirafyia', nameAr: 'غرب أبو فطيرة الحرفية' },
      { nameEn: 'Wista', nameAr: 'الوسطى' },
    ],
  },
  {
    governorate: { nameEn: 'Farwaniya', nameAr: 'الفروانية' },
    areas: [
      { nameEn: 'Abbasiya', nameAr: 'العباسية' },
      { nameEn: 'Abdullah Al-Mubarak', nameAr: 'عبدالله المبارك' },
      { nameEn: 'Al-Shadadiya', nameAr: 'الشدادية' },
      { nameEn: 'AlRabia', nameAr: 'الرابية' },
      { nameEn: 'AlRai', nameAr: 'الري' },
      { nameEn: 'alrihab', nameAr: 'الرحاب' },
      { nameEn: 'Andalous', nameAr: 'الأندلس' },
      { nameEn: 'Ardhiya', nameAr: 'العارضية' },
      { nameEn: 'Ardhiya 4', nameAr: 'العارضية 4' },
      { nameEn: 'Ardhiya 6', nameAr: 'العارضية 6' },
      { nameEn: 'Ardhiya Herafiya', nameAr: 'العارضية الحرفية' },
      { nameEn: 'Ardiya Small Industrial', nameAr: 'العارضية الصناعية الصغيرة' },
      { nameEn: 'Ardiya Storage Zone', nameAr: 'منطقة العارضية المخزنية' },
      { nameEn: 'Ashbeliah', nameAr: 'إشبيلية' },
      { nameEn: 'Dajeej', nameAr: 'الضجيج' },
      { nameEn: 'Establat Al Jahra', nameAr: 'إصطبلات الجهراء' },
      { nameEn: 'Farwaniya', nameAr: 'الفروانية' },
      { nameEn: 'Ferdous', nameAr: 'الفردوس' },
      { nameEn: 'International Airport', nameAr: 'مطار الكويت الدولي' },
      { nameEn: 'Ishbiliya', nameAr: 'إشبيلية' },
      { nameEn: 'Jleeb Al-Shyoukh', nameAr: 'جليب الشيوخ' },
      { nameEn: 'Khaitan', nameAr: 'خيطان' },
      { nameEn: 'Mubarakiya Camps', nameAr: 'مخيمات المباركية' },
      { nameEn: 'Mubarekiya Camps', nameAr: 'مخيمات المباركية' },
      { nameEn: 'Omariah', nameAr: 'العمرية' },
      { nameEn: 'Riggae', nameAr: 'الرقعي' },
      { nameEn: 'Sabah Al-Nasser', nameAr: 'صباح الناصر' },
      { nameEn: 'Sheikh Saad Airport', nameAr: 'مطار الشيخ سعد' },
      { nameEn: 'South Abdullah Al-Mubarak', nameAr: 'جنوب عبدالله المبارك' },
      { nameEn: 'South Khaitan', nameAr: 'جنوب خيطان' },
      { nameEn: 'West Abdullah Al Mubarak Al Sabah', nameAr: 'غرب عبدالله المبارك' },
    ],
  },
  {
    governorate: { nameEn: 'Hawalli', nameAr: 'حولي' },
    areas: [
      { nameEn: 'Al Bida\'a', nameAr: 'البدع' },
      { nameEn: 'Al-Shuhada', nameAr: 'الشهداء' },
      { nameEn: 'Al-Siddeeq', nameAr: 'الصديق' },
      { nameEn: 'Anjafa', nameAr: 'أنجفة' },
      { nameEn: 'Bayan', nameAr: 'بيان' },
      { nameEn: 'Free Trade Zone', nameAr: 'المنطقة الحرة' },
      { nameEn: 'Hateen', nameAr: 'حطين' },
      { nameEn: 'Hawally', nameAr: 'حولي' },
      { nameEn: 'Jabriya', nameAr: 'الجابرية' },
      { nameEn: 'Maidan Hawally', nameAr: 'ميدان حولي' },
      { nameEn: 'Ministries Area', nameAr: 'منطقة الوزارات' },
      { nameEn: 'Mishref', nameAr: 'مشرف' },
      { nameEn: 'Mubarak Al-Abdullah (West Mishref)', nameAr: 'مبارك العبدالله (غرب مشرف)' },
      { nameEn: 'Nugra', nameAr: 'النقرة' },
      { nameEn: 'Rumaithiya', nameAr: 'الرميثية' },
      { nameEn: 'Salam', nameAr: 'السلام' },
      { nameEn: 'Salmiya', nameAr: 'السالمية' },
      { nameEn: 'Salwa', nameAr: 'سلوى' },
      { nameEn: 'Shaab', nameAr: 'الشعب' },
      { nameEn: 'South Surra', nameAr: 'جنوب السرة' },
      { nameEn: 'Zahra', nameAr: 'الزهراء' },
    ],
  },
  {
    governorate: { nameEn: 'Jahra', nameAr: 'الجهراء' },
    areas: [
      { nameEn: 'Al Hejen', nameAr: 'الهجن' },
      { nameEn: 'Al Matla`', nameAr: 'المطلاع' },
      { nameEn: 'Al Sulaibiya Industrial 1', nameAr: 'الصليبية الصناعية 1' },
      { nameEn: 'Al Sulaibiya Industrial 2', nameAr: 'الصليبية الصناعية 2' },
      { nameEn: 'Amghara', nameAr: 'أمغرة' },
      { nameEn: 'Amghara Industry', nameAr: 'أمغرة الصناعية' },
      { nameEn: 'Jahra', nameAr: 'الجهراء' },
      { nameEn: 'Jahra Camps', nameAr: 'مخيمات الجهراء' },
      { nameEn: 'Jahra-Industrial', nameAr: 'الجهراء الصناعية' },
      { nameEn: 'Jawakher Al Jahra', nameAr: 'جواهر الجهراء' },
      { nameEn: 'Kabd', nameAr: 'كبد' },
      { nameEn: 'Kazima', nameAr: 'كاظمة' },
      { nameEn: 'Naeem', nameAr: 'النعيم' },
      { nameEn: 'Naseem', nameAr: 'النسيم' },
      { nameEn: 'North West Jahra', nameAr: 'شمال غرب الجهراء' },
      { nameEn: 'Oyoun', nameAr: 'العيون' },
      { nameEn: 'Qasr', nameAr: 'القصر' },
      { nameEn: 'Rajim Khashman', nameAr: 'رجوم خشمان' },
      { nameEn: 'Rawdatain', nameAr: 'الروضتين' },
      { nameEn: 'Saad AlAbdullah', nameAr: 'سعد العبدالله' },
      { nameEn: 'Subiyah', nameAr: 'الصبيحية' },
      { nameEn: 'Sulaibiya', nameAr: 'الصليبية' },
      { nameEn: 'Sulaibiya Agricultural', nameAr: 'الصليبية الزراعية' },
      { nameEn: 'Sulaibiya Industrial', nameAr: 'الصليبية الصناعية' },
      { nameEn: 'Sulaibiya Industrial 2', nameAr: 'الصليبية الصناعية 2' },
      { nameEn: 'Taima', nameAr: 'تيماء' },
      { nameEn: 'Waha', nameAr: 'الواحة' },
    ],
  },
  {
    governorate: { nameEn: 'Kuwait City', nameAr: 'العاصمة' },
    areas: [
      { nameEn: 'Abdulla Al-Salem', nameAr: 'عبدالله السالم' },
      { nameEn: 'Adailiya', nameAr: 'العديلية' },
      { nameEn: 'Al-Nahda', nameAr: 'النهضة' },
      { nameEn: 'Al-Sour Gardens', nameAr: 'حدائق السور' },
      { nameEn: 'Bneid Al Qar', nameAr: 'بنيد القار' },
      { nameEn: 'Daiya', nameAr: 'الدعية' },
      { nameEn: 'Dasma', nameAr: 'الدسمة' },
      { nameEn: 'Dasman', nameAr: 'دسمان' },
      { nameEn: 'Doha', nameAr: 'الدوحة' },
      { nameEn: 'Doha Chalets', nameAr: 'شاليهات الدوحة' },
      { nameEn: 'Faiha', nameAr: 'الفيحاء' },
      { nameEn: 'Ghornata', nameAr: 'غرناطة' },
      { nameEn: 'Hessah Al-Mubarak District', nameAr: 'ضاحية حصة المبارك' },
      { nameEn: 'Jaber Al Ahmad', nameAr: 'جابر الأحمد' },
      { nameEn: 'Jibla', nameAr: 'جبلة' },
      { nameEn: 'Kaifan', nameAr: 'كيفان' },
      { nameEn: 'Khaldiya', nameAr: 'الخالدية' },
      { nameEn: 'Kuwait City', nameAr: 'مدينة الكويت' },
      { nameEn: 'Mansouriya', nameAr: 'المنصورية' },
      { nameEn: 'Mina Doha', nameAr: 'ميناء الدوحة' },
      { nameEn: 'Mirgab', nameAr: 'المرقاب' },
      { nameEn: 'Mubarakiya', nameAr: 'المباركية' },
      { nameEn: 'Mubarakyia', nameAr: 'المباركية' },
      { nameEn: 'North West Al-Sulaibikhat', nameAr: 'شمال غرب الصليبخات' },
      { nameEn: 'Nuzha', nameAr: 'النزهة' },
      { nameEn: 'Qadsiya', nameAr: 'القادسية' },
      { nameEn: 'Qairawan', nameAr: 'القيروان' },
      { nameEn: 'Qibla', nameAr: 'قبلة' },
      { nameEn: 'Qortuba', nameAr: 'قرطبة' },
      { nameEn: 'Rai', nameAr: 'الري' },
      { nameEn: 'Rawda', nameAr: 'الروضة' },
      { nameEn: 'Salhiya', nameAr: 'الصالحية' },
      { nameEn: 'Sawabir', nameAr: 'الصوابر' },
      { nameEn: 'Shamiya', nameAr: 'الشامية' },
      { nameEn: 'Sharq', nameAr: 'شرق' },
      { nameEn: 'Shuwaikh', nameAr: 'الشويخ' },
      { nameEn: 'Shuwaikh Administrative', nameAr: 'الشويخ الإدارية' },
      { nameEn: 'Shuwaikh Educational', nameAr: 'الشويخ التعليمية' },
      { nameEn: 'Shuwaikh Industrial', nameAr: 'الشويخ الصناعية' },
      { nameEn: 'Shuwaikh Industrial 1', nameAr: 'الشويخ الصناعية 1' },
      { nameEn: 'Shuwaikh Industrial 2', nameAr: 'الشويخ الصناعية 2' },
      { nameEn: 'Shuwaikh Industrial 3', nameAr: 'الشويخ الصناعية 3' },
      { nameEn: 'Shuwaikh Medical', nameAr: 'الشويخ الطبية' },
      { nameEn: 'Shuwaikh Port', nameAr: 'ميناء الشويخ' },
      { nameEn: 'Shuwaikh Residential', nameAr: 'الشويخ السكنية' },
      { nameEn: 'Sulaibikhat', nameAr: 'الصليبخات' },
      { nameEn: 'Surra', nameAr: 'السرة' },
      { nameEn: 'Yarmouk', nameAr: 'اليرموك' },
    ],
  },
];

export const seedLocations = async (dataSource: DataSource): Promise<void> => {
  console.log('📍 Seeding Kuwait Governorates and Areas...');
  const govRepo = dataSource.getRepository(Governorate);
  const areaRepo = dataSource.getRepository(Area);

  let totalGovs = 0;
  let totalAreas = 0;

  for (const locData of KUWAIT_LOCATIONS_DATA) {
    let gov = await govRepo.findOne({
      where: { nameEn: locData.governorate.nameEn },
    });

    if (!gov) {
      gov = govRepo.create({
        nameEn: locData.governorate.nameEn,
        nameAr: locData.governorate.nameAr,
      });
      gov = await govRepo.save(gov);
      totalGovs++;
    } else if (gov.nameAr !== locData.governorate.nameAr) {
      gov.nameAr = locData.governorate.nameAr;
      await govRepo.save(gov);
    }

    for (const areaData of locData.areas) {
      let area = await areaRepo.findOne({
        where: {
          governorateId: gov.id,
          nameEn: areaData.nameEn,
        },
      });

      if (!area) {
        area = areaRepo.create({
          governorateId: gov.id,
          nameEn: areaData.nameEn,
          nameAr: areaData.nameAr,
        });
        await areaRepo.save(area);
        totalAreas++;
      } else if (area.nameAr !== areaData.nameAr) {
        area.nameAr = areaData.nameAr;
        await areaRepo.save(area);
      }
    }
  }

  console.log(`✅ Kuwait locations seeded successfully (${totalGovs} new govs, ${totalAreas} new areas).`);
};
