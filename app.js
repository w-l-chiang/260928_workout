/**
 * FitLog Pro - Application Logic & State Management
 * Fully integrated with exercises-dataset (1,324+ exercises),
 * Interactive Anatomical Muscle Heatmap & Weekend Squash Tracker.
 */

(function () {
  'use strict';

  // --- SUPABASE CLOUD CONFIGURATION ---
  const SUPABASE_URL = 'https://icvpncttmlsuvipchxqd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_lm1vQQxFm3yTTQ08NZ7Exg_HRE0vDID';
  let supabase = null;
  try {
    if (window.supabase && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) {
    console.warn('Supabase initialization failed:', e);
  }

  // --- PRESET PERIODIZATION PLANS (12-Week Progressive Blueprint) ---
  const PRESET_PLANS = {
    1: {
      name: 'Phase 1 : 初級入門適應期 (Week 1-4)',
      description: '自重動作與輕量啞鈴為主，建立動作控制與關節適應，融合肩袖肌群防護與脛前肌緩衝，週末搭配 1 小時壁球。',
      upper: [
        {
          id: '0662',
          name: 'Push-up (伏地挺身 / 跪姿可)',
          target: '胸大肌 (Chest / Pectorals)',
          muscleGroup: 'chest',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '8-12',
          suggestedWeight: 0,
          notes: '若標準伏地挺身較吃力，可改為跪姿或手推高處。核心收緊，手肘與身體呈 45 度夾角。'
        },
        {
          id: '0293',
          name: 'Dumbbell Bent-over Row (俯身雙臂啞鈴划船)',
          target: '背闊肌 / 上背 (Upper Back)',
          muscleGroup: 'back',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 5,
          notes: '屈髖俯身，背部打直不駝背，肩胛骨向後向下收緊帶動手肘向後拉。'
        },
        {
          id: '0405',
          name: 'Dumbbell Seated Shoulder Press (坐姿啞鈴肩推)',
          target: '三角肌 (Shoulders)',
          muscleGroup: 'delts',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 4,
          notes: '核心腹部微收，上推至頭頂上方但不完全鎖死手肘，離心緩慢下放。'
        },
        {
          id: '0334',
          name: 'Dumbbell Lateral Raise (啞鈴側平舉)',
          target: '三角肌中束 (Side Delts)',
          muscleGroup: 'delts',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '12-15',
          suggestedWeight: 2,
          notes: '輕重量即可，肘微屈，意念專注在肩膀側面帶起手臂至平行地面。'
        },
        {
          id: '0308',
          name: 'Dumbbell External Rotation (肩袖外旋肌群防護)',
          target: '肩袖肌群 / 棘下肌 (Rotator Cuff)',
          muscleGroup: 'delts',
          equipment: 'dumbbell / body weight',
          defaultSets: 3,
          targetReps: '每邊 12-15',
          suggestedWeight: 1.5,
          notes: '手肘夾緊身體呈90度，向外旋轉小臂。壁球高速揮拍與肩推最重要的防受傷保養動作！'
        },
        {
          id: '0276',
          name: 'Dead Bug (死蟲式核心穩定)',
          target: '深層核心 / 腹橫肌 (Abs)',
          muscleGroup: 'abs',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '12',
          suggestedWeight: 0,
          notes: '下背全程緊貼地面，對側手腳緩慢伸展，維持骨盆穩定不晃動。'
        }
      ],
      lower: [
        {
          id: '1760',
          name: 'Dumbbell Goblet Squat (啞鈴酒杯深蹲)',
          target: '股四頭肌 / 臀大肌 (Quads & Glutes)',
          muscleGroup: 'quads',
          equipment: 'dumbbell / body weight',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 6,
          notes: '雙手捧住啞鈴於胸前，膝蓋與腳尖同向，臀部向後下方蹲至大腿與地面平行。'
        },
        {
          id: '1459',
          name: 'Dumbbell Romanian Deadlift (啞鈴羅馬尼亞硬舉 RDL)',
          target: '膕繩肌 / 臀部肌群 (Hamstrings & Glutes)',
          muscleGroup: 'hamstrings',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 6,
          notes: '微屈膝，主要靠髖關節向後推（折疊），感受大腿後側拉伸感。'
        },
        {
          id: '0336',
          name: 'Dumbbell Lunge (自重/啞鈴弓箭步)',
          target: '股四頭肌 / 臀大肌 (Quads / Glutes)',
          muscleGroup: 'quads',
          equipment: 'dumbbell / body weight',
          defaultSets: 3,
          targetReps: '每邊 10',
          suggestedWeight: 4,
          notes: '跨步下蹲，前後膝關節皆約呈 90 度，軀幹保持直立穩定。'
        },
        {
          id: '3013',
          name: 'Glute Bridge (自重/負重臀橋)',
          target: '臀大肌 (Glutes)',
          muscleGroup: 'glutes',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '12-15',
          suggestedWeight: 0,
          notes: '雙腳踩地，以臀部發力將髖部頂起至與身體成一直線，頂峰收縮停頓 1 秒。'
        },
        {
          id: '0417',
          name: 'Dumbbell Standing Calf Raise (站姿啞鈴提踵)',
          target: '小腿腓腸肌 (Calves)',
          muscleGroup: 'calves',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '15-20',
          suggestedWeight: 4,
          notes: '前腳掌踩在微墊高處，緩慢墊腳提踵至最高點，充分擠壓小腿。'
        },
        {
          id: '1368',
          name: 'Wall Tibialis Raise (靠牆抬腳尖 / 脛前肌避震防護)',
          target: '脛骨前肌 / 踝關節 (Tibialis Anterior)',
          muscleGroup: 'calves',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '15-20',
          suggestedWeight: 0,
          notes: '背部靠牆雙腳前伸，勾起腳尖感受小腿迎面骨脛前肌酸脹。強化急停煞車與保護膝關節關鍵！'
        }
      ],
      mobility: [
        {
          id: '2567',
          name: 'Seated Piriformis Stretch (坐姿梨狀肌與髖關節開髖)',
          target: '臀肌 / 梨狀肌 / 髖關節囊',
          holdSeconds: 35,
          notes: '坐於地面或椅子將一腳跨在對側膝上，背部打直前傾，感受深層臀肌與梨狀肌展開。改善深蹲下不去與骨盆卡卡。'
        },
        {
          id: '1271',
          name: 'Chest & Shoulder Stretch (門框/牆壁胸大肌深層拉伸)',
          target: '胸大肌 / 三角肌前束',
          holdSeconds: 30,
          notes: '小臂貼於門框或牆面，軀幹緩慢向前推進並微轉，感受胸肌與肩膀前側充分展開，舒緩久坐打電腦圓肩。'
        },
        {
          id: '1424',
          name: 'Seated Glute Stretch (仰臥/坐姿臀肌深層放鬆)',
          target: '臀大肌 / 坐骨神經通道',
          holdSeconds: 35,
          notes: '雙手抱住膝蓋拉向胸前，感受臀大肌深層牽拉。有效緩解壁球深跨步救球後的臀部酸緊。'
        },
        {
          id: '1377',
          name: 'Wall Calf Stretch (牆壁小腿跟腱與比目魚肌拉伸)',
          target: '小腿腓腸肌 / 膕繩肌 / 足底筋膜',
          holdSeconds: 30,
          notes: '前腳掌貼在牆根或踢腳板，膝蓋打直身體前傾。幫助壁球頻繁急停跳躍後的跟腱回彈。'
        },
        {
          id: '1363',
          name: 'Spine Stretch (脊椎舒展與貓牛式放鬆)',
          target: '全脊椎 / 下背 / 背闊肌',
          holdSeconds: 45,
          notes: '緩慢拱背低頭與吸氣展胸，最後臀部坐向腳後跟放鬆雙臂前伸。釋放脊椎整週重訓與久坐壓力。'
        }
      ]
    },

    2: {
      name: 'Phase 2 : 中級肌力建立期 (Week 5-8)',
      description: '增加負荷與單側控制，著重離心慢放（2-3秒），強化壁球衝刺煞車與轉身抽球所需的旋轉核心。',
      upper: [
        {
          id: '0289',
          name: 'Dumbbell Bench Press (平躺啞鈴臥推)',
          target: '胸大肌 (Chest / Pectorals)',
          muscleGroup: 'chest',
          equipment: 'dumbbell',
          defaultSets: 4,
          targetReps: '8-10',
          suggestedWeight: 10,
          notes: '沉肩收胛，下放時手肘呈 45-60 度，向上推舉時感受胸部夾緊。'
        },
        {
          id: '0292',
          name: 'Dumbbell One-arm Row (單臂啞鈴划船)',
          target: '背闊肌 (Lats / Upper Back)',
          muscleGroup: 'back',
          equipment: 'dumbbell',
          defaultSets: 4,
          targetReps: '8-10',
          suggestedWeight: 10,
          notes: '單膝單手支撐於長凳，拉動手肘貼近身體上抬，頂峰收縮背部。'
        },
        {
          id: '2137',
          name: 'Dumbbell Arnold Press (阿諾肩推)',
          target: '三角肌前/中/後束 (Deltoids)',
          muscleGroup: 'delts',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 6,
          notes: '從掌心朝向自己旋轉推起至掌心朝前，提供肩部更完整的全範圍旋轉刺激。'
        },
        {
          id: '0285',
          name: 'Dumbbell Alternate Biceps Curl (啞鈴交替二頭彎舉)',
          target: '肱二頭肌 (Biceps)',
          muscleGroup: 'biceps',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 6,
          notes: '大臂夾緊身體兩側不晃動，旋前向上彎舉至最高點。'
        },
        {
          id: '0129',
          name: 'Bench Dip (長凳三頭臂屈伸)',
          target: '肱三頭肌 (Triceps)',
          muscleGroup: 'triceps',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 0,
          notes: '背部貼近長凳邊緣下放至手肘呈 90 度，三頭肌發力推回起始位置。'
        },
        {
          id: '0687',
          name: 'Dumbbell Russian Twist (負重俄羅斯轉體)',
          target: '腹斜肌 / 核心旋轉鏈 (Obliques & Core)',
          muscleGroup: 'abs',
          equipment: 'dumbbell / body weight',
          defaultSets: 3,
          targetReps: '20次 (每側10)',
          suggestedWeight: 3,
          notes: '坐姿屈膝微後傾，手持輕啞鈴帶動軀幹轉體觸地。強化壁球正反手轉體抽球爆發力！'
        }
      ],
      lower: [
        {
          id: '1760',
          name: 'Dumbbell Heavy Goblet Squat (大重量酒杯深蹲)',
          target: '股四頭肌 / 臀大肌 (Quads & Glutes)',
          muscleGroup: 'quads',
          equipment: 'dumbbell',
          defaultSets: 4,
          targetReps: '8-10',
          suggestedWeight: 14,
          notes: '適度增加負重，確保蹲深與下背平直，離心 3 秒緩慢下蹲。'
        },
        {
          id: '1459',
          name: 'Dumbbell Romanian Deadlift (重啞鈴 RDL)',
          target: '膕繩肌 / 臀大肌 (Hamstrings & Glutes)',
          muscleGroup: 'hamstrings',
          equipment: 'dumbbell',
          defaultSets: 4,
          targetReps: '8-10',
          suggestedWeight: 12,
          notes: '啞鈴貼近小腿下放，強化髖關節鉸鏈爆發力與張力。'
        },
        {
          id: '0336',
          name: 'Bulgarian Split Squat (保加利亞分腿蹲)',
          target: '股四頭肌 / 臀部單側力量 (Glutes & Quads)',
          muscleGroup: 'quads',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '每邊 8-10',
          suggestedWeight: 6,
          notes: '後腳墊高於長凳，前腳承受 80% 重量，是強化單側平衡與救球急停的王牌動作。'
        },
        {
          id: '0417',
          name: 'Dumbbell Standing Calf Raise (負重提踵)',
          target: '小腿肌群 (Calves)',
          muscleGroup: 'calves',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '12-15',
          suggestedWeight: 8,
          notes: '手持啞鈴加重，注意頂峰停頓與完全拉伸。'
        },
        {
          id: '3544',
          name: 'Side Plank (側平板支撐)',
          target: '腹斜肌 / 核心側鏈 (Obliques & Core)',
          muscleGroup: 'abs',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '每邊 30-45秒',
          suggestedWeight: 0,
          notes: '身體從頭至腳跟呈一直線，核心收緊，骨盆不往下沉。'
        },
        {
          id: '0020',
          name: 'Single-leg Balance & Tibialis (單腿閉眼平衡 + 靠牆抬腳尖)',
          target: '踝關節本體感覺 / 脛前肌 (Ankle Stability)',
          muscleGroup: 'calves',
          equipment: 'body weight',
          defaultSets: 3,
          targetReps: '每邊 30秒 / 20次',
          suggestedWeight: 0,
          notes: '單腳站立微屈膝訓練踝周微小肌肉，接續靠牆抬腳尖，強化壁球變向不翻船。'
        }
      ],
      mobility: [
        {
          id: '1604',
          name: 'World’s Greatest Stretch (世界上最偉大的伸展)',
          target: '胸椎旋轉 / 髖屈肌 / 臀肌 / 膕繩肌',
          holdSeconds: 40,
          notes: '深弓步下沉，同側手肘向下貼近地面，接著向天空打開胸椎並旋轉抬手臂。全方位打開活動度！'
        },
        {
          id: '1494',
          name: 'Butterfly Yoga Pose (蝴蝶式骨盆開髖伸展)',
          target: '臀大肌 / 內收肌群 / 骨盆底',
          holdSeconds: 40,
          notes: '坐姿雙腳腳掌相對併攏，雙手抱腳，雙膝向下沉並緩慢前傾，深層釋放大腿內側與髖部緊繃。'
        },
        {
          id: '0613',
          name: 'Lying Side Quads Stretch (側臥股四頭肌與髖屈肌拉伸)',
          target: '髂腰肌 / 股直肌',
          holdSeconds: 35,
          notes: '側臥手握上方腳踝拉向臀部，骨盆微後傾保持穩定，深層拉伸大腿前側與髖屈肌。'
        },
        {
          id: '1346',
          name: 'Kneeling Lat Stretch (跪姿背闊肌與側軀幹延展)',
          target: '背闊肌 / 大圓肌 / 肩關節後側',
          holdSeconds: 35,
          notes: '跪姿雙臂向前延伸貼地，臀部向後下沉，讓背闊肌與側軀幹充分拉伸延長。'
        },
        {
          id: '1585',
          name: 'Runner’s Lunge Stretch (跑者弓步大腿後側與小腿拉伸)',
          target: '整條後側鏈 / 膕繩肌 / 小腿比目魚肌',
          holdSeconds: 45,
          notes: '前後分腿呈低弓步，前腿微伸直勾起腳尖，感受大腿後側膕繩肌與小腿交替深層牽拉。'
        }
      ]
    },

    3: {
      name: 'Phase 3 : 強化突破期 (Week 9-12)',
      description: '多關節槓鈴/重啞鈴複合發力，挑戰漸進超負荷與極致爆發力，專項提升壁球擊球力量與急速折返體能。',
      upper: [
        {
          id: '0025',
          name: 'Barbell Bench Press (槓鈴/重啞鈴臥推)',
          target: '胸大肌 (Chest / Pectorals)',
          muscleGroup: 'chest',
          equipment: 'barbell / dumbbell',
          defaultSets: 4,
          targetReps: '6-8',
          suggestedWeight: 20,
          notes: '核心鎖死，雙腳扎實踩地，下放觸胸後爆發力推起。'
        },
        {
          id: '0652',
          name: 'Pull-up / Cable Lat Pulldown (引體向上 / 滑輪下拉)',
          target: '背闊肌 (Lats)',
          muscleGroup: 'back',
          equipment: 'body weight / cable',
          defaultSets: 4,
          targetReps: '6-8',
          suggestedWeight: 0,
          notes: '背部主動沉肩帶動，胸口迎向握把，拉伸與收縮幅度做滿。'
        },
        {
          id: '0027',
          name: 'Barbell / Dumbbell Bent-over Row (槓鈴/雙臂重划船)',
          target: '上背肌群 (Upper Back & Lats)',
          muscleGroup: 'back',
          equipment: 'barbell / dumbbell',
          defaultSets: 4,
          targetReps: '8-10',
          suggestedWeight: 15,
          notes: '俯身 45 度角，下背鎖緊，拉向肚臍下緣。'
        },
        {
          id: '0405',
          name: 'Seated Overhead Press (站姿/坐姿大重量肩推)',
          target: '三角肌 (Deltoids)',
          muscleGroup: 'delts',
          equipment: 'dumbbell / barbell',
          defaultSets: 3,
          targetReps: '8-10',
          suggestedWeight: 8,
          notes: '專注肩部三角肌爆發與穩定支撐。'
        },
        {
          id: '0334',
          name: 'Incline Y-Raise / Lateral Raise (斜板 Y-Raise / 側平舉)',
          target: '三角肌中束 / 下斜方與肩袖 (Lower Traps & Delts)',
          muscleGroup: 'delts',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '12-15',
          suggestedWeight: 3,
          notes: '俯臥於斜板呈 30 度向上舉成 Y 字型，極致活化下斜方肌與前鋸肌，打造無傷肩膀。'
        },
        {
          id: '0014',
          name: 'Standing Dumbbell Wood Chop (站姿啞鈴伐木旋轉)',
          target: '腹斜肌 / 爆發旋轉鏈 (Core Rotational Power)',
          muscleGroup: 'abs',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '每邊 10',
          suggestedWeight: 5,
          notes: '由低向高對角線旋轉揮動啞鈴，下肢蹬轉帶動核心，是壁球扣殺與強力抽球的專項肌力！'
        }
      ],
      lower: [
        {
          id: '0043',
          name: 'Barbell Squat / Heavy Dumbbell Squat (槓鈴/重啞鈴深蹲)',
          target: '股四頭肌 / 臀大肌 (Quads & Glutes)',
          muscleGroup: 'quads',
          equipment: 'barbell / dumbbell',
          defaultSets: 4,
          targetReps: '6-8',
          suggestedWeight: 25,
          notes: '站姿略寬於肩，深吸氣腹壓建立，蹲至髖低於膝。'
        },
        {
          id: '0032',
          name: 'Barbell Deadlift (傳統/羅馬尼亞硬舉)',
          target: '後側鏈 / 臀大肌 / 豎脊肌 (Posterior Chain)',
          muscleGroup: 'hamstrings',
          equipment: 'barbell / dumbbell',
          defaultSets: 4,
          targetReps: '5-8',
          suggestedWeight: 30,
          notes: '雙腿蹬地帶動髖部前推，鎖定核心與背部。'
        },
        {
          id: '0336',
          name: 'Walking Lunges (負重行進弓箭步)',
          target: '臀腿爆發與穩定 (Legs & Glutes)',
          muscleGroup: 'quads',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '12-16 步',
          suggestedWeight: 8,
          notes: '連續前行跨步，步幅適中，膝關節穩定不內扣。'
        },
        {
          id: '1409',
          name: 'Barbell Glute Bridge (負重臀推/臀橋)',
          target: '臀大肌 (Glutes)',
          muscleGroup: 'glutes',
          equipment: 'barbell / dumbbell',
          defaultSets: 3,
          targetReps: '10-12',
          suggestedWeight: 20,
          notes: '臀部頂峰收縮停留 2 秒，打造飽滿臀型。'
        },
        {
          id: '1459',
          name: 'Single-leg Dumbbell RDL (單腿啞鈴羅馬尼亞硬舉)',
          target: '單側後側鏈與臀中肌平衡 (Hamstrings & Glute Medius)',
          muscleGroup: 'hamstrings',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '每側 8-10',
          suggestedWeight: 6,
          notes: '單腳支撐屈髖，另一腿向後伸展成一直線。修復左右腿力量不均與壁球單腳蹬跨支撐。'
        },
        {
          id: '0417',
          name: 'Deficit Calf & Tibialis Raise (階梯深層提踵 + 脛前肌極致強化)',
          target: '小腿肌群全方位 / 踝關節 (Calves & Tibialis)',
          muscleGroup: 'calves',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '15-20',
          suggestedWeight: 8,
          notes: '腳跟下沉至最低點獲得完全拉伸，頂峰提踵停留 1 秒，接續靠牆抬腳尖。'
        }
      ],
      mobility: [
        {
          id: '2571',
          name: 'Rocking Frog Stretch (蛙式前後搖擺深層開髖)',
          target: '大腿內收肌群 / 髖臼深層靈活度',
          holdSeconds: 45,
          notes: '雙膝大跨度分開跪地，雙腳內側貼地，小臂撐地後前後搖擺，慢慢將臀部向後推。極佳釋放大跨步救球緊繃。'
        },
        {
          id: '1512',
          name: 'All Fours Quad Stretch (四足跪姿髖屈肌與股四頭深度放鬆)',
          target: '髂腰肌 / 股直肌 / 骨盆前傾矯正',
          holdSeconds: 45,
          notes: '四足跪姿，向後抓住腳踝拉向臀部，軀幹微挺直。深層解鎖深蹲與大重量後的下背與髖屈緊繃！'
        },
        {
          id: '1419',
          name: 'Iron Cross Spinal Twist (鐵十字式胸腰椎旋轉放鬆)',
          target: '胸大肌 / 髖屈肌 / 胸腰椎旋轉鏈',
          holdSeconds: 35,
          notes: '仰臥雙臂向兩側平展，一側腿抬起彎曲並跨過身體觸碰對側地面。極佳緩解旋轉打球後的脊椎壓力。'
        },
        {
          id: '1365',
          name: 'Upper Back Stretch (上背與肩胛穿針式流動)',
          target: '胸椎靈活度 / 後肩 / 菱形肌',
          holdSeconds: 40,
          notes: '雙手抱肩或穿過腋下，呼氣時向天空打開旋轉。增加壁球上肢揮拍幅度。'
        },
        {
          id: '1686',
          name: 'Squat with Overhead Reach & Twist (深蹲底部旋轉延伸開髖)',
          target: '踝關節背屈 / 髖關節 / 胸椎旋轉',
          holdSeconds: 50,
          notes: '蹲至最低點，一手扶地一手向天空旋轉打開，同時增加腳踝活動度避免深蹲卡腳踝。'
        }
      ]
    }
  };

  // --- 58+ ZERO-EQUIPMENT MOBILITY & STRETCHING DATABASE ---
  const MOBILITY_EXERCISES_DB = [
    // 1. 髖關節與臀部開髖 (16 動作)
    {
      id: '1604',
      name: 'World’s Greatest Stretch (世界上最偉大的伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '胸椎旋轉 / 髖屈肌 / 臀肌 / 膕繩肌',
      holdSeconds: 40,
      notes: '深弓步下沉，同側手肘向下貼近地面，接著向天空打開胸椎並旋轉抬手臂。全方位打開活動度！'
    },
    {
      id: '2567',
      name: 'Seated Piriformis Stretch (坐姿梨狀肌與髖關節開髖)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀肌 / 梨狀肌 / 髖關節囊',
      holdSeconds: 35,
      notes: '坐於地面或椅子將一腳跨在對側膝上，背部打直前傾，感受深層臀肌與梨狀肌展開。改善深蹲下不去與骨盆卡卡。'
    },
    {
      id: '1494',
      name: 'Butterfly Yoga Pose (蝴蝶式骨盆開髖伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀大肌 / 內收肌群 / 骨盆底',
      holdSeconds: 40,
      notes: '坐姿雙腳腳掌相對併攏，雙手抱腳，雙膝向下沉並緩慢前傾，深層釋放大腿內側與髖部緊繃。'
    },
    {
      id: '2571',
      name: 'Rocking Frog Stretch (蛙式前後搖擺深層開髖)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '大腿內收肌群 / 髖臼深層靈活度',
      holdSeconds: 45,
      notes: '雙膝大跨度分開跪地，雙腳內側貼地，小臂撐地後前後搖擺，慢慢將臀部向後推。極佳釋放大跨步救球緊繃。'
    },
    {
      id: '1424',
      name: 'Seated Glute Stretch (仰臥/坐姿臀肌深層放鬆)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀大肌 / 坐骨神經通道',
      holdSeconds: 35,
      notes: '雙手抱住膝蓋拉向胸前，感受臀大肌深層牽拉。有效緩解壁球深跨步救球後的臀部酸緊。'
    },
    {
      id: '3013',
      name: 'Low Glute Bridge Stretch (自重臀橋與髖部伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀大肌 / 髖關節前側',
      holdSeconds: 30,
      notes: '雙腳踩地頂起髖部，頂峰收緊臀部並舒展大腿前側與骨盆。'
    },
    {
      id: '3645',
      name: 'Single Leg Bridge with Outstretched Leg (單腿伸展臀橋)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀肌 / 骨盆穩定鏈',
      holdSeconds: 30,
      notes: '一腿伸直，單側發力頂起髖部，加強骨盆左右平衡。'
    },
    {
      id: '1466',
      name: 'Twist Hip Lift (轉體髖部挺伸流動)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀大肌 / 腹斜肌 / 髖關節',
      holdSeconds: 30,
      notes: '仰臥轉動骨盆向上抬起，釋放骨盆旋轉緊繃感。'
    },
    {
      id: '1422',
      name: 'Pelvic Tilt into Bridge (骨盆後傾銜接臀橋)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '下背豎脊肌 / 骨盆底肌群',
      holdSeconds: 35,
      notes: '先將下背壓平地面使骨盆後傾，再順勢頂起臀部，是放鬆下背疼痛的黃金動作。'
    },
    {
      id: '1774',
      name: 'Side Bridge Hip Abduction (側橋髖外展伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀中肌 / 髖外展肌群',
      holdSeconds: 30,
      notes: '側身撐起並抬起上方腿，活化並伸展臀中肌，增強單腿落地煞車穩定。'
    },
    {
      id: '3561',
      name: 'Glute Bridge March (臀橋交替踏步伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀肌 / 髖屈肌 / 膕繩肌',
      holdSeconds: 35,
      notes: '維持臀橋高度，雙腿輪流微抬踏步，動態放鬆腰臀交界處。'
    },
    {
      id: '3523',
      name: 'Glute Bridge Two Legs on Bench (長凳高位臀橋伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀大肌 / 髖關節全範圍伸展',
      holdSeconds: 35,
      notes: '雙腳墊高於長凳或沙發，大幅度伸展髖關節前側與收緊臀肌。'
    },
    {
      id: '0668',
      name: 'Rear Decline Bridge (俯臥下斜背橋伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀肌 / 膕繩肌 / 下背',
      holdSeconds: 30,
      notes: '反向支撐打開前側軀幹，伸展髖部與胸肩。'
    },
    {
      id: '3214',
      name: 'Arms Apart Circular Toe Touch (雙臂分開圓周觸腳伸展)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀大肌 / 膕繩肌 / 側髖',
      holdSeconds: 35,
      notes: '雙臂平展，身體向斜下方旋轉觸碰對側腳尖，全方位拉伸臀腿後側鏈。'
    },
    {
      id: '3212',
      name: 'Basic Toe Touch (基礎直腿屈體觸腳尖)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '臀肌 / 膕繩肌 / 豎脊肌',
      holdSeconds: 30,
      notes: '雙腿併攏微屈膝前屈下沉，深層放鬆大腿後側與臀大肌。'
    },
    {
      id: '1460',
      name: 'Walking Lunge Stretch (行進低弓步深層開髖)',
      cat: 'hip_glutes',
      catName: '🦵 髖關節與臀部',
      target: '髂腰肌 / 臀大肌 / 股四頭肌',
      holdSeconds: 35,
      notes: '大步向前跨出，骨盆下沉感受後腿髖屈肌深層拉伸。'
    },

    // 2. 胸部、肩膀與手臂 (12 動作)
    {
      id: '1271',
      name: 'Chest & Front Shoulder Stretch (門框/牆壁胸大肌深層拉伸)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '胸大肌 / 三角肌前束',
      holdSeconds: 30,
      notes: '小臂貼於門框或牆面，軀幹緩慢向前推進並微轉，感受胸肌與肩膀前側充分展開，舒緩久坐打電腦圓肩。'
    },
    {
      id: '1167',
      name: 'Dynamic Chest Stretch (動態擴胸展開伸展)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '胸大肌 / 菱形肌 / 前三角肌',
      holdSeconds: 30,
      notes: '雙臂向後水平打開展開胸腔，配合深呼吸，快速釋放胸背緊繃。'
    },
    {
      id: '1405',
      name: 'Back Pec Stretch (站姿胸大肌與上背拉伸)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '胸大肌 / 背闊肌 / 三角肌',
      holdSeconds: 30,
      notes: '手指交叉於身前或身後，緩慢向上向外延伸，感受胸背充分延展。'
    },
    {
      id: '0669',
      name: 'Rear Deltoid Stretch (三角肌後束與後肩拉伸)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '三角肌後束 / 菱形肌 / 旋轉袖',
      holdSeconds: 30,
      notes: '一手橫跨胸前，另一手將其壓向胸口，放鬆壁球頻繁擊球後的後肩肌群。'
    },
    {
      id: '0643',
      name: 'Overhead Triceps Stretch (過頭肱三頭肌拉伸)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '肱三頭肌 / 背闊肌上緣',
      holdSeconds: 30,
      notes: '手肘向上彎曲置於腦後，對側手輕壓手肘下沉，深層拉伸大臂後側。'
    },
    {
      id: '0817',
      name: 'Standing Triceps Stretch (站姿三頭肌延展)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '肱三頭肌 / 肩關節後側',
      holdSeconds: 30,
      notes: '挺胸直立，將大臂貼近耳朵向上拉伸，消除推舉與伏地挺身後的疲勞。'
    },
    {
      id: '0721',
      name: 'Side Wrist Pull Stretch (側向手腕牽引與前臂拉伸)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '前臂屈肌群 / 腕關節',
      holdSeconds: 25,
      notes: '手臂前伸手掌朝前，對側手輕拉指尖向身體，放鬆壁球握拍與打字滑鼠手。'
    },
    {
      id: '1428',
      name: 'Wrist Circles (手腕繞環關節靈活性)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '前臂旋前肌 / 腕韌帶',
      holdSeconds: 30,
      notes: '雙手十指相扣順時針與逆時針輕柔旋轉，增加揮拍手腕靈活度。'
    },
    {
      id: '1403',
      name: 'Neck Side Stretch (頸側斜方肌放鬆伸展)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '肩胛提肌 / 上斜方肌',
      holdSeconds: 30,
      notes: '一手置於身後，頭部緩慢倒向對側肩膀，釋放低頭用手機與聳肩壓力。'
    },
    {
      id: '0716',
      name: 'Side Push Neck Stretch (側推頸部深層放鬆)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '斜角肌 / 頸部肌群',
      holdSeconds: 30,
      notes: '手掌輕扶頭部側面微施壓拉伸，緩解肩頸僵硬。'
    },
    {
      id: '1685',
      name: 'Squat to Overhead Reach (深蹲過頭延伸舒展)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '胸椎活動度 / 三角肌 / 髖關節',
      holdSeconds: 35,
      notes: '下蹲同時雙臂高舉過頭，伸展胸椎與背闊肌。'
    },
    {
      id: '1687',
      name: 'Posterior Step to Overhead Reach (後退步過頭延展)',
      cat: 'chest_shoulders',
      catName: '👕 胸肩與手臂',
      target: '腹直肌 / 背闊肌 / 髖屈肌',
      holdSeconds: 35,
      notes: '單腳後退跨步，雙臂向上向後延伸，全面舒展前側筋膜鏈。'
    },

    // 3. 脊椎、下背與核心旋轉 (13 動作)
    {
      id: '1363',
      name: 'Spine Stretch (脊椎舒展與貓牛式放鬆)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '全脊椎 / 下背 / 背闊肌',
      holdSeconds: 45,
      notes: '緩慢拱背低頭與吸氣展胸，最後臀部坐向腳後跟放鬆雙臂前伸。釋放脊椎整週重訓與久坐壓力。'
    },
    {
      id: '1346',
      name: 'Kneeling Lat Stretch (跪姿背闊肌與側軀幹延展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '背闊肌 / 大圓肌 / 肩關節後側',
      holdSeconds: 35,
      notes: '跪姿雙臂向前延伸貼地，臀部向後下沉，讓背闊肌與側軀幹充分拉伸延長。'
    },
    {
      id: '1419',
      name: 'Iron Cross Spinal Twist (鐵十字式胸腰椎旋轉放鬆)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '胸大肌 / 髖屈肌 / 胸腰椎旋轉鏈',
      holdSeconds: 35,
      notes: '仰臥雙臂向兩側平展，一側腿抬起彎曲並跨過身體觸碰對側地面。極佳緩解旋轉打球後的脊椎壓力。'
    },
    {
      id: '3639',
      name: 'Bent Knee Lying Twist (仰臥雙屈膝轉體放鬆)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '腰椎豎脊肌 / 腹斜肌',
      holdSeconds: 35,
      notes: '雙膝彎曲併攏，平躺將雙膝倒向兩側，雙肩保持貼地，釋放腰椎壓力。'
    },
    {
      id: '0690',
      name: 'Seated Lower Back Stretch (坐姿下背放鬆伸展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '下背豎脊肌 / 背闊肌',
      holdSeconds: 35,
      notes: '坐姿雙腿分開，上半身向前向下放鬆下沉，深層舒展下背肌群。'
    },
    {
      id: '0794',
      name: 'Standing Lateral Stretch (站姿側體延展伸展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '腹內外斜肌 / 背闊肌 / 腰方肌',
      holdSeconds: 30,
      notes: '一手向上延伸，身體向對側側彎，拉長整條側腰與肋間肌。'
    },
    {
      id: '1358',
      name: 'Side Lying Floor Stretch (側臥地板背闊伸展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '背闊肌 / 上背 / 側肋',
      holdSeconds: 35,
      notes: '側臥於墊上，手臂向前上方延伸，感受背闊肌側向牽引。'
    },
    {
      id: '1365',
      name: 'Upper Back Stretch (上背與肩胛穿針式流動)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '胸椎靈活度 / 後肩 / 菱形肌',
      holdSeconds: 40,
      notes: '雙手抱肩或穿過腋下，呼氣時向天空打開旋轉。增加壁球上肢揮拍幅度。'
    },
    {
      id: '1366',
      name: 'Upward Facing Dog (上犬式脊椎舒展伸展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '腹直肌 / 脊椎前側 / 髖屈肌',
      holdSeconds: 35,
      notes: '雙手撐地推起上半身，胸部展開，伸展腹直肌與脊椎前側。'
    },
    {
      id: '2329',
      name: 'Spine Twist (坐姿脊椎扭轉伸展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '腹斜肌 / 胸椎旋轉靈活度',
      holdSeconds: 35,
      notes: '坐姿一腿跨過另一腿，手臂抵住膝蓋向後轉體，改善脊椎旋轉角度。'
    },
    {
      id: '0464',
      name: 'Front Plank with Twist (平板轉體伸展流動)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '深層核心 / 腹斜肌 / 腰椎',
      holdSeconds: 30,
      notes: '棒式支撐下緩慢將骨盆倒向兩側，動態釋放腰腹張力。'
    },
    {
      id: '0002',
      name: '45° Side Bend (45度側向側屈伸展)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '腹斜肌 / 腰方肌',
      holdSeconds: 30,
      notes: '站立順著大腿向下側滑，伸展對側側腰與腰方肌。'
    },
    {
      id: '3231',
      name: 'Two Toe Touch (雙向觸腳尖脊椎放鬆)',
      cat: 'spine_back',
      catName: '🧘 脊椎與核心',
      target: '全背豎脊肌 / 膕繩肌',
      holdSeconds: 30,
      notes: '放鬆頭部與肩膀，雙手自然下垂觸碰腳尖，感受脊椎一節節拉長。'
    },

    // 4. 大腿前側 (股四頭) 與後側 (膕繩肌) (11 動作)
    {
      id: '0613',
      name: 'Lying Side Quads Stretch (側臥股四頭肌與髖屈肌拉伸)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '髂腰肌 / 股直肌',
      holdSeconds: 35,
      notes: '側臥手握上方腳踝拉向臀部，骨盆微後傾保持穩定，深層拉伸大腿前側與髖屈肌。'
    },
    {
      id: '1512',
      name: 'All Fours Quad Stretch (四足跪姿髖屈肌與股四頭深度放鬆)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '髂腰肌 / 股直肌 / 骨盆前傾矯正',
      holdSeconds: 45,
      notes: '四足跪姿，向後抓住腳踝拉向臀部，軀幹微挺直。深層解鎖深蹲與大重量後的下背與髖屈緊繃！'
    },
    {
      id: '1585',
      name: 'Runner’s Lunge Stretch (跑者弓步大腿後側與小腿拉伸)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '整條後側鏈 / 膕繩肌 / 小腿比目魚肌',
      holdSeconds: 45,
      notes: '前後分腿呈低弓步，前腿微伸直勾起腳尖，感受大腿後側膕繩肌與小腿交替深層牽拉。'
    },
    {
      id: '1511',
      name: 'Hamstring Stretch (坐姿/站姿單腿膕繩肌拉伸)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '膕繩肌 / 大腿後側',
      holdSeconds: 35,
      notes: '一腿前伸腳跟點地，屈髖向後下沉，背部打直感受大腿後側拉長。'
    },
    {
      id: '1576',
      name: 'Leg Up Hamstring Stretch (仰臥抬腿大腿後側牽引)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '膕繩肌 / 坐骨神經通道',
      holdSeconds: 35,
      notes: '平躺雙手抱住大腿後側向上伸展，放鬆大腿後側緊繃。'
    },
    {
      id: '1587',
      name: 'Seated Wide Angle Pose (坐姿大分腿開髖靈活序列)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '大腿內收肌群 / 膕繩肌',
      holdSeconds: 45,
      notes: '雙腿寬幅分開坐於墊上，雙手向前爬行下沉，深度打開雙腿內側與髖部。'
    },
    {
      id: '1548',
      name: 'Chair Leg Extended Stretch (椅子單腿前伸延展)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '股四頭肌 / 髖屈肌',
      holdSeconds: 30,
      notes: '坐在椅子邊緣單腿後屈或前伸，辦公室久坐時的最佳微放鬆動作。'
    },
    {
      id: '1688',
      name: 'Lunge with Twist (弓步軀幹轉體伸展)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '股四頭肌 / 髖屈肌 / 胸椎旋轉',
      holdSeconds: 35,
      notes: '弓步下沉同時軀幹向同側腿方向旋轉，同步放鬆腿部與腰椎。'
    },
    {
      id: '3470',
      name: 'Forward Lunge Stretch (前跨步低弓步伸展)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '股四頭肌 / 臀大肌',
      holdSeconds: 35,
      notes: '大幅度向前跨步下沉，雙手置於膝上，拉伸後腿大腿前側。'
    },
    {
      id: '3218',
      name: 'Hands Clasped Circular Toe Touch (雙手相扣圓周觸腳)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '膕繩肌 / 臀肌 / 下背',
      holdSeconds: 35,
      notes: '雙手相扣做大圓周俯身觸腳，動態牽拉整條大腿後側鏈。'
    },
    {
      id: '3215',
      name: 'Hands Reversed Circular Toe Touch (反向相扣圓周觸腳)',
      cat: 'legs_thighs',
      catName: '👖 大腿前後側',
      target: '大腿後側 / 側向筋膜鏈',
      holdSeconds: 35,
      notes: '反手旋轉觸腳，增加腿部旋轉活動度。'
    },

    // 5. 小腿腓腸肌、比目魚肌與腳踝 (6 動作)
    {
      id: '1377',
      name: 'Calf Stretch with Hands Against Wall (牆壁小腿跟腱與比目魚肌拉伸)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '小腿腓腸肌 / 膕繩肌 / 足底筋膜',
      holdSeconds: 30,
      notes: '前腳掌貼在牆根或踢腳板，膝蓋打直身體前傾。幫助壁球頻繁急停跳躍後的跟腱回彈。'
    },
    {
      id: '1407',
      name: 'Calf Push Stretch Against Wall (雙手推牆小腿深層拉伸)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '小腿腓腸肌 / 比目魚肌',
      holdSeconds: 30,
      notes: '雙手推牆，後腿腳跟扎實踩地，膝蓋微屈或打直，徹底消除小腿蘿蔔緊繃。'
    },
    {
      id: '1398',
      name: 'Standing Calves Calf Stretch (站姿階梯下沉小腿拉伸)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '小腿腓腸肌 / 跟腱',
      holdSeconds: 30,
      notes: '前腳掌踩在階梯邊緣，腳後跟向下方懸空下沉，獲得最大幅度拉伸。'
    },
    {
      id: '1390',
      name: 'Seated Calf Stretch (坐姿勾腳尖小腿伸展)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '小腿肌群 / 足底筋膜',
      holdSeconds: 30,
      notes: '坐姿雙腿前伸，手握腳尖向身體方向拉動，緩解足底與小腿酸脹。'
    },
    {
      id: '1368',
      name: 'Ankle Circles (腳踝繞環活動度與脛前肌防護)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '踝關節穩定性 / 脛骨前肌',
      holdSeconds: 30,
      notes: '抬起單腳順逆時針充分轉動腳踝，提升壁球變向靈活度並預防翻船。'
    },
    {
      id: '0257',
      name: 'Circles Knee Stretch (屈膝環繞小腿與膝關節放鬆)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '膝關節滑囊 / 小腿上緣',
      holdSeconds: 30,
      notes: '雙膝微屈雙手扶膝做小幅度圓周環繞，放鬆膝部與小腿上側筋膜。'
    },
    {
      id: '1686',
      name: 'Squat with Overhead Reach & Twist (深蹲底部旋轉延伸開髖)',
      cat: 'calves_ankles',
      catName: '👟 小腿與腳踝',
      target: '踝關節背屈 / 髖關節 / 胸椎旋轉',
      holdSeconds: 50,
      notes: '蹲至最低點，一手扶地一手向天空旋轉打開，同時增加腳踝活動度避免深蹲卡腳踝。'
    }
  ];

  // Chinese Names mapping for Muscle Groups
  const MUSCLE_NAMES_ZH = {
    chest: '胸大肌 (Chest)',
    back: '背闊肌 & 上背 (Lats & Upper Back)',
    delts: '三角肌 / 肩部 (Deltoids)',
    biceps: '肱二頭肌 (Biceps)',
    triceps: '肱三頭肌 (Triceps)',
    forearms: '前臂肌群 (Forearms)',
    abs: '腹直肌 & 核心 (Abs & Core)',
    quads: '股四頭肌 / 大腿前側 (Quads)',
    hamstrings: '膕繩肌 / 大腿後側 (Hamstrings)',
    glutes: '臀大肌 (Glutes)',
    calves: '小腿腓腸肌 (Calves)',
    lower_back: '下背 / 豎脊肌 (Lower Back)'
  };

  // --- APP STATE ---
  const state = {
    currentPhase: 1,
    currentDay: 'upper', // 'upper', 'lower', 'squash', 'mobility'
    currentExercises: [],
    customMobilityList: null, // Custom user selection of mobility stretches
    activeStretchCategory: 'all',
    logs: {}, // In-memory session working logs
    heatmapRange: '30', // '7', '30', 'all'
    selectedMuscle: null,
    timer: {
      interval: null,
      secondsLeft: 90,
      targetSeconds: 90,
      isRunning: false
    }
  };

  // Audio Beep Generator using Web Audio API
  function playBeep(freq = 880, duration = 0.15) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  // --- PASSCODE PRIVACY SECURITY (PIN: 1116) ---
  const CORRECT_PIN = '1116';

  function checkAuthStatus() {
    const isAuth = localStorage.getItem('fitlog_auth_token') === 'fitlog_authorized_1116';
    const lockOverlay = document.getElementById('lockOverlay');
    if (lockOverlay) {
      if (isAuth) {
        lockOverlay.classList.add('unlocked');
      } else {
        lockOverlay.classList.remove('unlocked');
        const pinInput = document.getElementById('pinInput');
        if (pinInput) setTimeout(() => pinInput.focus(), 150);
      }
    }
    return isAuth;
  }

  function handleUnlock() {
    const pinInput = document.getElementById('pinInput');
    const errorMsg = document.getElementById('lockErrorMsg');
    const enteredPin = (pinInput ? pinInput.value : '').trim();

    if (enteredPin === CORRECT_PIN) {
      localStorage.setItem('fitlog_auth_token', 'fitlog_authorized_1116');
      if (errorMsg) errorMsg.classList.add('hidden');
      const lockOverlay = document.getElementById('lockOverlay');
      if (lockOverlay) lockOverlay.classList.add('unlocked');
      showToast('🔓 歡迎回來！FitLog Pro 已解鎖');
      syncWithSupabase();
    } else {
      if (errorMsg) errorMsg.classList.remove('hidden');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
      playBeep(380, 0.25);
    }
  }

  function handleLock() {
    localStorage.removeItem('fitlog_auth_token');
    const lockOverlay = document.getElementById('lockOverlay');
    const pinInput = document.getElementById('pinInput');
    if (lockOverlay) lockOverlay.classList.remove('unlocked');
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
    showToast('🔒 已重新鎖定此裝置');
  }

  // --- INITIALIZATION ---
  function init() {
    checkAuthStatus();
    loadSavedSettings();
    setupDatesToday();
    bindEvents();
    renderCurrentWorkout();
    renderHistory();
    renderHeatmap();
    if (localStorage.getItem('fitlog_auth_token') === 'fitlog_authorized_1116') {
      syncWithSupabase();
    }
  }

  // --- SUPABASE CLOUD SYNC FUNCTIONS ---
  async function syncWithSupabase() {
    const badge = document.getElementById('cloudSyncBadge');
    if (!supabase) {
      if (badge) {
        badge.innerHTML = '<span class="sync-dot" style="background:#f59e0b; box-shadow:none;"></span><span class="sync-text" style="color:#f59e0b">離線模式</span>';
      }
      return;
    }

    try {
      if (badge) {
        badge.innerHTML = '<span class="sync-dot"></span><span class="sync-text">連線同步中...</span>';
      }

      const { data, error } = await supabase
        .from('fitlog_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error:', error);
        if (badge) {
          badge.innerHTML = '<span class="sync-dot" style="background:#6b7280; box-shadow:none;"></span><span class="sync-text" style="color:#9ca3af">待建資料表</span>';
          badge.title = '請至 Supabase 建立 fitlog_history 資料表（如未建立仍可本機儲存）';
        }
        return;
      }

      if (data && Array.isArray(data)) {
        // If Supabase has data, update local storage and re-render
        if (data.length > 0) {
          localStorage.setItem('fitlog_history', JSON.stringify(data));
          renderHistory();
          renderHeatmap();
        } else {
          // If Supabase is empty but local has items, upload local items
          const localHist = getHistory();
          if (localHist.length > 0) {
            for (const item of localHist) {
              await supabase.from('fitlog_history').upsert(item);
            }
          }
        }

        if (badge) {
          badge.innerHTML = '<span class="sync-dot" style="background:#10b981;"></span><span class="sync-text" style="color:#34d399">雲端已同步</span>';
          badge.title = `已與 Supabase 即時同步 (共有 ${data.length} 筆紀錄)`;
        }
      }
    } catch (err) {
      console.warn('Supabase sync error:', err);
      if (badge) {
        badge.innerHTML = '<span class="sync-dot" style="background:#6b7280; box-shadow:none;"></span><span class="sync-text" style="color:#9ca3af">本機模式</span>';
      }
    }
  }

  function loadSavedSettings() {
    try {
      const savedPhase = localStorage.getItem('fitlog_phase');
      if (savedPhase && PRESET_PLANS[savedPhase]) {
        state.currentPhase = parseInt(savedPhase, 10);
      }
    } catch (e) {}

    // Update active phase tabs in header
    document.querySelectorAll('.phase-tab').forEach(tab => {
      tab.classList.toggle('active', parseInt(tab.dataset.phase, 10) === state.currentPhase);
    });
  }

  function setupDatesToday() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('workoutDate');
    const squashDateInput = document.getElementById('squashDate');
    const mobilityDateInput = document.getElementById('mobilityDate');
    if (dateInput) dateInput.value = today;
    if (squashDateInput) squashDateInput.value = today;
    if (mobilityDateInput) mobilityDateInput.value = today;
  }

  // --- EVENT BINDINGS ---
  function bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(`tab-${tab.dataset.tab}`);
        if (target) target.classList.add('active');

        if (tab.dataset.tab === 'history') {
          renderHeatmap();
        }
      });
    });

    // Phase selector in header
    document.querySelectorAll('.phase-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.currentPhase = parseInt(tab.dataset.phase, 10);
        localStorage.setItem('fitlog_phase', state.currentPhase);
        document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderCurrentWorkout();
        showToast(`已切換至 ${PRESET_PLANS[state.currentPhase].name}`);
      });
    });

    // Select Phase buttons inside Curriculum cards
    document.querySelectorAll('.select-phase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPhase = parseInt(btn.dataset.targetPhase, 10);
        state.currentPhase = targetPhase;
        localStorage.setItem('fitlog_phase', state.currentPhase);
        document.querySelectorAll('.phase-tab').forEach(t => {
          t.classList.toggle('active', parseInt(t.dataset.phase, 10) === targetPhase);
        });
        document.querySelector('[data-tab="workout"]').click();
        renderCurrentWorkout();
        showToast(`已載入 ${PRESET_PLANS[targetPhase].name}`);
      });
    });

    // Day Switcher (Upper / Lower / Squash / Mobility)
    document.querySelectorAll('.day-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.day-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.currentDay = pill.dataset.day;
        renderCurrentWorkout();
      });
    });

    // Rest Timer Buttons
    document.querySelectorAll('.timer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.timer.targetSeconds = parseInt(btn.dataset.sec, 10);
        state.timer.secondsLeft = state.timer.targetSeconds;
        updateTimerDisplay();
      });
    });

    document.getElementById('timerToggleBtn').addEventListener('click', toggleTimer);
    document.getElementById('timerResetBtn').addEventListener('click', resetTimer);

    // RPE Slider label update (Strength)
    const rpeSlider = document.getElementById('sessionRpe');
    const rpeLabel = document.getElementById('sessionRpeValue');
    if (rpeSlider && rpeLabel) {
      rpeSlider.addEventListener('input', () => {
        const val = parseInt(rpeSlider.value, 10);
        let desc = '';
        if (val <= 4) desc = '極輕度熱身感';
        else if (val <= 6) desc = '適中負荷 (還能做 4-5 下)';
        else if (val === 7) desc = '中高強度 (還能做 2~3 下)';
        else if (val === 8) desc = '黃金增肌區間 (還能做 2 下)';
        else if (val === 9) desc = '極高強度 (極限剩 1 下)';
        else desc = '極限力竭 (無法再多做 1 下)';
        rpeLabel.textContent = `RPE ${val} (${desc})`;
      });
    }

    // Squash RPE Slider
    const squashRpeSlider = document.getElementById('squashRpe');
    const squashRpeLabel = document.getElementById('squashRpeValue');
    if (squashRpeSlider && squashRpeLabel) {
      squashRpeSlider.addEventListener('input', () => {
        const val = parseInt(squashRpeSlider.value, 10);
        let desc = '';
        if (val <= 6) desc = '輕鬆練球 / 步伐熱身';
        else if (val <= 7) desc = '中度心肺對打 (微喘)';
        else if (val === 8) desc = '高強度心肺，呼吸急促汗流浹背';
        else desc = '極高強度對抗賽 / 體能極限燃燒';
        squashRpeLabel.textContent = `RPE ${val} (${desc})`;
      });
    }

    // Mobility Feel Slider
    const mobilityFeelSlider = document.getElementById('mobilityFeel');
    const mobilityFeelLabel = document.getElementById('mobilityFeelValue');
    if (mobilityFeelSlider && mobilityFeelLabel) {
      mobilityFeelSlider.addEventListener('input', () => {
        const val = parseInt(mobilityFeelSlider.value, 10);
        let desc = '';
        if (val <= 5) desc = '輕度伸展';
        else if (val <= 7) desc = '關節微熱，肌肉張力釋放';
        else if (val <= 8) desc = '深度舒展，緊繃感明顯消除';
        else desc = '全身肌肉顯著放鬆，關節活動度大增';
        mobilityFeelLabel.textContent = `${val} 分 (${desc})`;
      });
    }

    // Mood Chips
    document.querySelectorAll('.mood-chips .mood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const parent = chip.closest('.mood-chips');
        parent.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Save Workout (Strength)
    document.getElementById('saveSessionBtn').addEventListener('click', saveWorkoutSession);
    document.getElementById('resetSessionBtn').addEventListener('click', resetCurrentSessionForm);

    // Save Squash
    document.getElementById('saveSquashBtn').addEventListener('click', saveSquashSession);

    // Save Mobility
    const saveMobilityBtn = document.getElementById('saveMobilityBtn');
    if (saveMobilityBtn) {
      saveMobilityBtn.addEventListener('click', saveMobilitySession);
    }

    // Heatmap Time Range Filter
    document.querySelectorAll('#heatmapTimeFilter .time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#heatmapTimeFilter .time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.heatmapRange = btn.dataset.range;
        renderHeatmap();
      });
    });

    // Interactive Heatmap Muscle Path Clicks
    document.querySelectorAll('.muscle-node').forEach(node => {
      node.addEventListener('click', () => {
        const muscleKey = node.dataset.muscle;
        selectMuscleDetail(muscleKey);
      });
      node.addEventListener('mouseenter', () => {
        const muscleKey = node.dataset.muscle;
        selectMuscleDetail(muscleKey);
      });
    });

    // Exercise Detail Modal
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
      document.getElementById('exerciseModal').classList.add('hidden');
    });

    // Library Modal
    document.getElementById('openLibraryBtn').addEventListener('click', openLibraryModal);
    document.getElementById('libraryCloseBtn').addEventListener('click', () => {
      document.getElementById('libraryModal').classList.add('hidden');
    });
    document.getElementById('librarySearchInput').addEventListener('input', filterLibrary);
    document.getElementById('bodyPartFilter').addEventListener('change', filterLibrary);

    // Stretch Picker Modal (58+ Mobility Library)
    const openStretchPickerBtn = document.getElementById('openStretchPickerBtn');
    if (openStretchPickerBtn) {
      openStretchPickerBtn.addEventListener('click', openStretchPickerModal);
    }
    const stretchPickerCloseBtn = document.getElementById('stretchPickerCloseBtn');
    if (stretchPickerCloseBtn) {
      stretchPickerCloseBtn.addEventListener('click', () => {
        document.getElementById('stretchPickerModal').classList.add('hidden');
      });
    }
    const resetMobilityDefaultBtn = document.getElementById('resetMobilityDefaultBtn');
    if (resetMobilityDefaultBtn) {
      resetMobilityDefaultBtn.addEventListener('click', () => {
        state.customMobilityList = null;
        renderMobilityWorkout();
        showToast('🔄 已恢復當前週期的預設 5 大推薦伸展！');
      });
    }

    // Category Tabs in Stretch Picker
    document.querySelectorAll('#stretchCategoryTabs .stretch-cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#stretchCategoryTabs .stretch-cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeStretchCategory = btn.dataset.cat;
        filterStretchPicker();
      });
    });

    const stretchSearchInput = document.getElementById('stretchSearchInput');
    if (stretchSearchInput) {
      stretchSearchInput.addEventListener('input', filterStretchPicker);
    }

    // Export & Clear History
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Passcode Lock / Unlock Events
    const unlockBtn = document.getElementById('unlockBtn');
    const pinInput = document.getElementById('pinInput');
    const lockAppBtn = document.getElementById('lockAppBtn');

    if (unlockBtn) unlockBtn.addEventListener('click', handleUnlock);
    if (pinInput) {
      pinInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleUnlock();
        else if (pinInput.value.length === 4) handleUnlock();
      });
      pinInput.addEventListener('input', () => {
        if (pinInput.value.length === 4) handleUnlock();
      });
    }
    if (lockAppBtn) lockAppBtn.addEventListener('click', handleLock);
  }

  // --- WORKOUT RENDERING ---
  function renderCurrentWorkout() {
    const isSquash = state.currentDay === 'squash';
    const isMobility = state.currentDay === 'mobility';

    const strengthGrid = document.getElementById('strengthWorkoutGrid');
    const squashView = document.getElementById('squashWorkoutView');
    const mobilityView = document.getElementById('mobilityWorkoutView');
    const strengthStatsBar = document.getElementById('strengthStatsBar');
    const restTimerWidget = document.getElementById('restTimerWidget');

    if (isSquash) {
      strengthGrid.style.display = 'none';
      strengthStatsBar.style.display = 'none';
      restTimerWidget.style.display = 'none';
      if (mobilityView) mobilityView.classList.add('hidden');
      squashView.classList.remove('hidden');
      return;
    } else if (isMobility) {
      strengthGrid.style.display = 'none';
      strengthStatsBar.style.display = 'none';
      restTimerWidget.style.display = 'none';
      squashView.classList.add('hidden');
      if (mobilityView) {
        mobilityView.classList.remove('hidden');
        renderMobilityWorkout();
      }
      return;
    } else {
      strengthGrid.style.display = 'grid';
      strengthStatsBar.style.display = 'flex';
      restTimerWidget.style.display = 'flex';
      squashView.classList.add('hidden');
      if (mobilityView) mobilityView.classList.add('hidden');
    }

    const plan = PRESET_PLANS[state.currentPhase];
    const exercises = plan[state.currentDay] || [];
    state.currentExercises = exercises;

    const container = document.getElementById('exercisesList');
    container.innerHTML = '';

    let totalPossibleSets = 0;
    let completedSets = 0;

    exercises.forEach((ex, exIndex) => {
      const dbItem = window.EXERCISES_DB ? window.EXERCISES_DB.find(item => item.id === ex.id) : null;
      const thumbUrl = dbItem ? dbItem.image : `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/${ex.id}-2gPfomN.jpg`;
      const gifUrl = dbItem ? dbItem.gif_url : '';

      const card = document.createElement('div');
      card.className = 'glass-panel exercise-card';
      card.dataset.exerciseId = ex.id;

      // Initialize session sets state if not present
      const stateKey = `${state.currentPhase}_${state.currentDay}_${ex.id}`;
      if (!state.logs[stateKey]) {
        state.logs[stateKey] = [];
        for (let s = 1; s <= ex.defaultSets; s++) {
          state.logs[stateKey].push({
            setNum: s,
            weight: ex.suggestedWeight || 0,
            reps: parseInt(ex.targetReps.split('-')[0], 10) || 10,
            completed: false
          });
        }
      }

      const setsData = state.logs[stateKey];
      totalPossibleSets += setsData.length;
      setsData.forEach(s => {
        if (s.completed) completedSets++;
      });

      card.innerHTML = `
        <div class="exercise-header-row">
          <div class="exercise-title-meta">
            <img src="${thumbUrl}" alt="${ex.name}" class="exercise-thumbnail-preview" onerror="this.src='https://placehold.co/80x80/1a1f2c/ffffff?text=FIT'" title="點擊放大查看動畫">
            <div class="exercise-info">
              <h4 title="點擊查看動作指引與動畫">${ex.name}</h4>
              <div class="exercise-tags">
                <span class="tag-badge target">${ex.target}</span>
                <span class="tag-badge equip">${ex.equipment}</span>
                <span class="tag-badge">目標: ${ex.defaultSets}組 × ${ex.targetReps}下</span>
              </div>
            </div>
          </div>
          <div class="exercise-actions-top">
            <button class="btn btn-outline btn-sm view-details-btn" data-exid="${ex.id}" data-gif="${gifUrl}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>動作示範</span>
            </button>
          </div>
        </div>

        ${ex.notes ? `<div style="font-size:0.78rem; color:#9ca3af; margin-bottom:0.6rem; padding: 4px 8px; background: rgba(0,0,0,0.2); border-radius:4px;">💡 <strong>動作要點：</strong>${ex.notes}</div>` : ''}

        <div class="sets-table-wrapper">
          <table class="sets-table">
            <thead>
              <tr>
                <th>組數</th>
                <th>負重 (kg)</th>
                <th>次數 (Reps)</th>
                <th>打卡完成</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="setsBody_${stateKey}">
              ${setsData.map((s, idx) => `
                <tr data-set-index="${idx}">
                  <td>Set ${s.setNum}</td>
                  <td>
                    <input type="number" class="set-input weight-input" min="0" step="0.5" value="${s.weight}" placeholder="kg">
                  </td>
                  <td>
                    <input type="number" class="set-input reps-input" min="1" step="1" value="${s.reps}">
                  </td>
                  <td>
                    <button class="set-check-btn ${s.completed ? 'completed' : ''}" data-state-key="${stateKey}" data-index="${idx}">
                      ✓
                    </button>
                  </td>
                  <td>
                    <button class="set-actions-btn delete-set-btn" data-state-key="${stateKey}" data-index="${idx}" title="刪除此組">&times;</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="add-set-row-btn" data-state-key="${stateKey}">+ 新增一組 (Add Set)</button>
        </div>
      `;

      container.appendChild(card);
    });

    // Update Set Stats
    document.getElementById('totalSetsDisplay').textContent = `${totalPossibleSets} 組`;
    document.getElementById('completedSetsCount').textContent = `${completedSets} 組`;

    bindCardEvents();
  }

  // --- RENDER MOBILITY WORKOUT FLOW ---
  function renderMobilityWorkout() {
    const plan = PRESET_PLANS[state.currentPhase];
    const mobilityExercises = state.customMobilityList || plan.mobility || [];
    const container = document.getElementById('mobilityExercisesList');
    const countDisplay = document.getElementById('mobilityCountDisplay');
    if (countDisplay) {
      countDisplay.textContent = mobilityExercises.length;
    }
    if (!container) return;

    container.innerHTML = '';

    mobilityExercises.forEach((ex, idx) => {
      const dbItem = window.EXERCISES_DB ? window.EXERCISES_DB.find(item => item.id === ex.id) : null;
      const thumbUrl = dbItem ? dbItem.image : `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/${ex.id}-2gPfomN.jpg`;
      const gifUrl = dbItem ? dbItem.gif_url : '';
      const stateKey = `mobility_${state.currentPhase}_${ex.id || idx}`;

      if (state.logs[stateKey] === undefined) {
        state.logs[stateKey] = false;
      }

      const isCompleted = state.logs[stateKey];
      const isCustomList = state.customMobilityList !== null;

      const card = document.createElement('div');
      card.className = 'glass-panel exercise-card mobility-card';
      card.dataset.mobilityId = ex.id || idx;

      card.innerHTML = `
        <div class="exercise-header-row">
          <div class="exercise-title-meta">
            <img src="${thumbUrl}" alt="${ex.name}" class="exercise-thumbnail-preview" onerror="this.src='https://placehold.co/80x80/083344/ffffff?text=STRETCH'" title="點擊查看示範">
            <div class="exercise-info">
              <h4 style="color:#22d3ee;">${ex.name}</h4>
              <div class="exercise-tags">
                <span class="tag-badge target" style="background:rgba(6,182,212,0.15); color:#22d3ee;">放鬆部位: ${ex.target}</span>
                <span class="tag-badge equip">徒手零器材</span>
                <span class="tag-badge">建議保持: ${ex.holdSeconds || 30} 秒</span>
              </div>
            </div>
          </div>
          <div class="exercise-actions-top" style="display:flex; align-items:center; gap:8px;">
            ${dbItem ? `
              <button class="btn btn-outline btn-sm view-details-btn" data-exid="${ex.id}" data-gif="${gifUrl}">
                <span>示範</span>
              </button>
            ` : ''}
            ${isCustomList ? `
              <button class="remove-stretch-card-btn" data-id="${ex.id}" title="從今日清單移除此動作">&times;</button>
            ` : ''}
          </div>
        </div>

        <div style="font-size:0.83rem; color:#cbd5e1; margin-bottom:0.85rem; line-height:1.45; padding: 6px 10px; background: rgba(0,0,0,0.25); border-radius:6px;">
          🧘 <strong>伸展指引：</strong>${ex.notes}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid rgba(255,255,255,0.06);">
          <button class="hold-timer-btn" data-seconds="${ex.holdSeconds || 30}" data-state-key="${stateKey}">
            <span>⏱️ 開始保持倒數 (${ex.holdSeconds || 30}s)</span>
          </button>
          <button class="set-check-btn ${isCompleted ? 'completed' : ''}" data-state-key="${stateKey}" title="標記完成">
            ✓
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    bindMobilityEvents();
  }

  function bindMobilityEvents() {
    // Hold Timer countdown on mobility cards
    document.querySelectorAll('.hold-timer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('running')) return;
        const totalSec = parseInt(btn.dataset.seconds, 10) || 30;
        let leftSec = totalSec;
        const stateKey = btn.dataset.stateKey;

        btn.classList.add('running');
        btn.querySelector('span').textContent = `⏳ 深度保持中... (${leftSec}s)`;
        playBeep(600, 0.1);

        const holdInterval = setInterval(() => {
          leftSec--;
          if (leftSec > 0) {
            btn.querySelector('span').textContent = `⏳ 深度保持中... (${leftSec}s)`;
            if (leftSec <= 3) playBeep(750, 0.08);
          } else {
            clearInterval(holdInterval);
            btn.classList.remove('running');
            btn.classList.add('completed');
            btn.querySelector('span').textContent = `✨ 伸展完成 (${totalSec}s)`;
            playBeep(1100, 0.4);
            showToast('🎉 伸展完成！肌肉已獲得深層放鬆');
            
            // Mark check button
            state.logs[stateKey] = true;
            const checkBtn = btn.parentElement.querySelector('.set-check-btn');
            if (checkBtn) checkBtn.classList.add('completed');
          }
        }, 1000);
      });
    });

    // Check complete toggle
    document.querySelectorAll('#mobilityExercisesList .set-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stateKey = btn.dataset.stateKey;
        state.logs[stateKey] = !state.logs[stateKey];
        btn.classList.toggle('completed', state.logs[stateKey]);
        if (state.logs[stateKey]) {
          playBeep(980, 0.12);
        }
      });
    });

    // Remove single stretch card from custom list
    document.querySelectorAll('.remove-stretch-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.id;
        if (state.customMobilityList) {
          state.customMobilityList = state.customMobilityList.filter(item => item.id !== exId);
          renderMobilityWorkout();
          showToast('已自今日清單移除此伸展動作');
        }
      });
    });

    // Modal detail
    document.querySelectorAll('#mobilityExercisesList .view-details-btn, #mobilityExercisesList .exercise-thumbnail-preview, #mobilityExercisesList .exercise-info h4').forEach(el => {
      el.addEventListener('click', () => {
        const card = el.closest('.mobility-card');
        const exId = card.dataset.mobilityId;
        openExerciseModal(exId);
      });
    });
  }

  // --- STRETCH PICKER MODAL (58+ MOBILITY LIBRARY) ---
  function openStretchPickerModal() {
    const modal = document.getElementById('stretchPickerModal');
    if (!modal) return;
    
    // If not initialized yet, clone from preset plan
    if (!state.customMobilityList) {
      const plan = PRESET_PLANS[state.currentPhase];
      state.customMobilityList = [...(plan.mobility || [])];
    }

    modal.classList.remove('hidden');
    filterStretchPicker();
  }

  function filterStretchPicker() {
    const query = (document.getElementById('stretchSearchInput').value || '').toLowerCase().trim();
    const cat = state.activeStretchCategory || 'all';
    const grid = document.getElementById('stretchPickerGrid');
    if (!grid) return;

    const currentSelectedIds = new Set((state.customMobilityList || []).map(item => item.id));

    const filtered = MOBILITY_EXERCISES_DB.filter(item => {
      const matchCat = cat === 'all' || item.cat === cat;
      const matchText = !query ||
        item.name.toLowerCase().includes(query) ||
        item.target.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query) ||
        item.catName.toLowerCase().includes(query);
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="color:#9ca3af; padding:2.5rem; grid-column:1/-1; text-align:center;">找不到相符的伸展動作，請嘗試更換分類或關鍵字。</div>';
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const isSelected = currentSelectedIds.has(item.id);
      const dbItem = window.EXERCISES_DB ? window.EXERCISES_DB.find(db => db.id === item.id) : null;
      const thumbUrl = dbItem ? dbItem.image : `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/${item.id}-2gPfomN.jpg`;

      return `
        <div class="stretch-picker-card ${isSelected ? 'selected' : ''}" data-id="${item.id}">
          <div class="stretch-picker-card-header">
            <img src="${thumbUrl}" alt="${item.name}" class="stretch-thumb" onerror="this.src='https://placehold.co/60x60/083344/ffffff?text=STRETCH'" title="點擊查看詳細說明">
            <div class="stretch-picker-info">
              <h5>${item.name}</h5>
              <div class="stretch-picker-meta">
                <span class="stretch-hold-tag">${item.catName}</span>
                <span class="stretch-hold-tag">⏱️ ${item.holdSeconds}s</span>
              </div>
            </div>
          </div>
          <p class="stretch-picker-desc">${item.notes}</p>
          <div class="stretch-picker-actions">
            <button class="btn btn-outline btn-sm preview-stretch-btn" data-id="${item.id}">
              🔍 示範動畫
            </button>
            <button class="add-stretch-btn ${isSelected ? 'active' : ''}" data-id="${item.id}">
              ${isSelected ? '✓ 已加入今日' : '➕ 加入今日'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind preview detail click
    grid.querySelectorAll('.preview-stretch-btn, .stretch-thumb, h5').forEach(el => {
      el.addEventListener('click', (e) => {
        const card = el.closest('.stretch-picker-card');
        const exId = card.dataset.id;
        openExerciseModal(exId);
      });
    });

    // Bind add/remove toggle click
    grid.querySelectorAll('.add-stretch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.id;
        const targetItem = MOBILITY_EXERCISES_DB.find(m => m.id === exId);
        if (!targetItem) return;

        if (!state.customMobilityList) {
          const plan = PRESET_PLANS[state.currentPhase];
          state.customMobilityList = [...(plan.mobility || [])];
        }

        const existsIndex = state.customMobilityList.findIndex(m => m.id === exId);
        if (existsIndex >= 0) {
          state.customMobilityList.splice(existsIndex, 1);
          btn.classList.remove('active');
          btn.textContent = '➕ 加入今日';
          btn.closest('.stretch-picker-card').classList.remove('selected');
          showToast(`已移除「${targetItem.name.split('(')[0]}」`);
        } else {
          state.customMobilityList.push({
            id: targetItem.id,
            name: targetItem.name,
            target: targetItem.target,
            holdSeconds: targetItem.holdSeconds,
            notes: targetItem.notes
          });
          btn.classList.add('active');
          btn.textContent = '✓ 已加入今日';
          btn.closest('.stretch-picker-card').classList.add('selected');
          showToast(`🎉 已成功將「${targetItem.name.split('(')[0]}」加入今日清單！`);
        }

        renderMobilityWorkout();
      });
    });
  }

  // --- SAVE MOBILITY SESSION ---
  function saveMobilitySession() {
    const date = document.getElementById('mobilityDate').value || new Date().toISOString().split('T')[0];
    const feel = parseInt(document.getElementById('mobilityFeel').value, 10) || 9;
    const notes = document.getElementById('mobilityNotes').value;
    const plan = PRESET_PLANS[state.currentPhase];
    const mobilityExercises = state.customMobilityList || plan.mobility || [];

    const completed = [];
    mobilityExercises.forEach((ex, idx) => {
      const stateKey = `mobility_${state.currentPhase}_${ex.id || idx}`;
      if (state.logs[stateKey]) {
        completed.push(ex.name);
      }
    });

    const mobilityRecord = {
      id: 'mobility_' + Date.now(),
      type: 'mobility',
      date,
      dayType: '🧘 休息日・徒手伸展 (Mobility Flow)',
      phase: state.currentPhase,
      phaseName: plan.name,
      feel,
      completedCount: completed.length || mobilityExercises.length,
      exercises: completed.length > 0 ? completed : mobilityExercises.map(m => m.name),
      notes,
      createdAt: new Date().toISOString()
    };

    let history = getHistory();
    history.unshift(mobilityRecord);
    localStorage.setItem('fitlog_history', JSON.stringify(history));

    if (supabase) {
      supabase.from('fitlog_history').upsert(mobilityRecord).then(({ error }) => {
        if (error) console.warn('Supabase mobility save error:', error);
      });
    }

    showToast('🎉 休息日伸展打卡成功！全身筋膜已深度修復！');
    renderHistory();
    renderHeatmap();

    document.querySelector('[data-tab="history"]').click();
  }


  function bindCardEvents() {
    // View detail modal
    document.querySelectorAll('.view-details-btn, .exercise-thumbnail-preview, .exercise-info h4').forEach(el => {
      el.addEventListener('click', (e) => {
        const card = el.closest('.exercise-card');
        const exId = card.dataset.exerciseId;
        openExerciseModal(exId);
      });
    });

    // Check set completed
    document.querySelectorAll('.set-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.stateKey;
        const idx = parseInt(btn.dataset.index, 10);
        const row = btn.closest('tr');
        const weight = parseFloat(row.querySelector('.weight-input').value) || 0;
        const reps = parseInt(row.querySelector('.reps-input').value, 10) || 0;

        state.logs[key][idx].weight = weight;
        state.logs[key][idx].reps = reps;
        state.logs[key][idx].completed = !state.logs[key][idx].completed;

        if (state.logs[key][idx].completed) {
          playBeep(980, 0.12);
          startTimer();
          showToast(`第 ${idx + 1} 組完成！開始休息倒數`);
        }

        renderCurrentWorkout();
      });
    });

    // Input changes
    document.querySelectorAll('.weight-input, .reps-input').forEach(input => {
      input.addEventListener('change', () => {
        const row = input.closest('tr');
        const tbody = row.closest('tbody');
        const key = tbody.id.replace('setsBody_', '');
        const idx = parseInt(row.dataset.setIndex, 10);
        state.logs[key][idx].weight = parseFloat(row.querySelector('.weight-input').value) || 0;
        state.logs[key][idx].reps = parseInt(row.querySelector('.reps-input').value, 10) || 0;
      });
    });

    // Add Set Row
    document.querySelectorAll('.add-set-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.stateKey;
        const lastSet = state.logs[key][state.logs[key].length - 1];
        state.logs[key].push({
          setNum: state.logs[key].length + 1,
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 10,
          completed: false
        });
        renderCurrentWorkout();
      });
    });

    // Delete Set Row
    document.querySelectorAll('.delete-set-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.stateKey;
        const idx = parseInt(btn.dataset.index, 10);
        if (state.logs[key].length > 1) {
          state.logs[key].splice(idx, 1);
          state.logs[key].forEach((s, i) => s.setNum = i + 1);
          renderCurrentWorkout();
        }
      });
    });
  }

  // --- TIMER FUNCTIONS ---
  function updateTimerDisplay() {
    const minutes = Math.floor(state.timer.secondsLeft / 60);
    const seconds = state.timer.secondsLeft % 60;
    const str = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const display = document.getElementById('timerDigits');
    if (display) display.textContent = str;
  }

  function startTimer() {
    clearInterval(state.timer.interval);
    state.timer.secondsLeft = state.timer.targetSeconds;
    state.timer.isRunning = true;
    document.getElementById('timerToggleBtn').textContent = '暫停計時';
    document.getElementById('timerToggleBtn').classList.remove('btn-primary');
    document.getElementById('timerToggleBtn').classList.add('btn-secondary');

    state.timer.interval = setInterval(() => {
      if (state.timer.secondsLeft > 0) {
        state.timer.secondsLeft--;
        updateTimerDisplay();
        if (state.timer.secondsLeft === 3 || state.timer.secondsLeft === 2 || state.timer.secondsLeft === 1) {
          playBeep(700, 0.08);
        }
      } else {
        clearInterval(state.timer.interval);
        state.timer.isRunning = false;
        document.getElementById('timerToggleBtn').textContent = '開始休息';
        document.getElementById('timerToggleBtn').classList.add('btn-primary');
        document.getElementById('timerToggleBtn').classList.remove('btn-secondary');
        playBeep(1050, 0.35);
        showToast('⏰ 休息時間到！準備下一組！🔥');
      }
    }, 1000);
    updateTimerDisplay();
  }

  function toggleTimer() {
    if (state.timer.isRunning) {
      clearInterval(state.timer.interval);
      state.timer.isRunning = false;
      document.getElementById('timerToggleBtn').textContent = '繼續計時';
      document.getElementById('timerToggleBtn').classList.add('btn-primary');
      document.getElementById('timerToggleBtn').classList.remove('btn-secondary');
    } else {
      startTimer();
    }
  }

  function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.isRunning = false;
    state.timer.secondsLeft = state.timer.targetSeconds;
    document.getElementById('timerToggleBtn').textContent = '開始休息';
    document.getElementById('timerToggleBtn').classList.add('btn-primary');
    document.getElementById('timerToggleBtn').classList.remove('btn-secondary');
    updateTimerDisplay();
  }

  // --- SAVE WORKOUT SESSION (STRENGTH) ---
  function saveWorkoutSession() {
    const date = document.getElementById('workoutDate').value || new Date().toISOString().split('T')[0];
    const rpe = parseInt(document.getElementById('sessionRpe').value, 10) || 7;
    const activeMood = document.querySelector('#strengthWorkoutGrid .mood-chip.active');
    const mood = activeMood ? activeMood.dataset.mood : '⚡ 正常發揮';
    const notes = document.getElementById('sessionNotes').value;

    const plan = PRESET_PLANS[state.currentPhase];
    const exercises = plan[state.currentDay] || [];

    let totalVolume = 0;
    let completedSetsCount = 0;
    const completedExercises = [];

    exercises.forEach(ex => {
      const stateKey = `${state.currentPhase}_${state.currentDay}_${ex.id}`;
      const sets = state.logs[stateKey] || [];
      const doneSets = sets.filter(s => s.completed);
      if (doneSets.length > 0) {
        let exVolume = 0;
        doneSets.forEach(s => {
          exVolume += (s.weight || 0) * (s.reps || 0);
        });
        totalVolume += exVolume;
        completedSetsCount += doneSets.length;
        completedExercises.push({
          id: ex.id,
          name: ex.name,
          target: ex.target,
          muscleGroup: ex.muscleGroup || 'chest',
          sets: doneSets
        });
      }
    });

    if (completedSetsCount === 0) {
      if (!confirm('你尚未勾選任何完成的組數，確定仍要儲存今日打卡嗎？')) {
        return;
      }
    }

    const sessionRecord = {
      id: 'session_' + Date.now(),
      type: 'strength',
      date,
      phase: state.currentPhase,
      phaseName: plan.name,
      dayType: state.currentDay === 'upper' ? 'Day 1 : 上半身訓練 (週二)' : 'Day 2 : 下半身訓練 (週四)',
      rpe,
      mood,
      notes,
      totalVolume,
      completedSetsCount,
      exercises: completedExercises,
      createdAt: new Date().toISOString()
    };

    let history = getHistory();
    history.unshift(sessionRecord);
    localStorage.setItem('fitlog_history', JSON.stringify(history));

    // Async write to Supabase
    if (supabase) {
      supabase.from('fitlog_history').upsert(sessionRecord).then(({ error }) => {
        if (error) console.warn('Supabase save error:', error);
      });
    }

    showToast('🎉 今日重訓打卡成功！數據已存入日誌與人體熱點圖！');
    renderHistory();
    renderHeatmap();

    document.querySelector('[data-tab="history"]').click();
  }

  // --- SAVE SQUASH SESSION ---
  function saveSquashSession() {
    const date = document.getElementById('squashDate').value || new Date().toISOString().split('T')[0];
    const duration = parseInt(document.getElementById('squashDuration').value, 10) || 60;
    const rpe = parseInt(document.getElementById('squashRpe').value, 10) || 8;
    const activeJoint = document.querySelector('#squashJointStatus .mood-chip.active');
    const jointStatus = activeJoint ? activeJoint.dataset.val : '✨ 良好無痛';
    const notes = document.getElementById('squashNotes').value;

    const squashRecord = {
      id: 'squash_' + Date.now(),
      type: 'squash',
      date,
      dayType: '🏸 週末壁球運動 (Squash)',
      duration,
      rpe,
      jointStatus,
      notes,
      caloriesBurned: Math.round(duration * 10.8), // approx 650 kcal/hr
      createdAt: new Date().toISOString()
    };

    let history = getHistory();
    history.unshift(squashRecord);
    localStorage.setItem('fitlog_history', JSON.stringify(history));

    // Async write to Supabase
    if (supabase) {
      supabase.from('fitlog_history').upsert(squashRecord).then(({ error }) => {
        if (error) console.warn('Supabase squash save error:', error);
      });
    }

    showToast('🎉 週末壁球打卡成功！已點亮人體熱點圖下肢與核心！');
    renderHistory();
    renderHeatmap();

    document.querySelector('[data-tab="history"]').click();
  }

  function resetCurrentSessionForm() {
    if (confirm('確定要清空當前填寫的組數與筆記嗎？')) {
      const plan = PRESET_PLANS[state.currentPhase];
      const exercises = plan[state.currentDay] || [];
      exercises.forEach(ex => {
        const stateKey = `${state.currentPhase}_${state.currentDay}_${ex.id}`;
        delete state.logs[stateKey];
      });
      document.getElementById('sessionNotes').value = '';
      renderCurrentWorkout();
      showToast('已重設當前填寫');
    }
  }

  // --- HISTORY & STATS ---
  function getHistory() {
    try {
      const raw = localStorage.getItem('fitlog_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function renderHistory() {
    const history = getHistory();
    const totalWorkouts = history.length;
    let totalVolume = 0;
    let totalSquashMins = 0;

    history.forEach(h => {
      if (h.type === 'squash') {
        totalSquashMins += (h.duration || 60);
      } else {
        totalVolume += (h.totalVolume || 0);
      }
    });

    document.getElementById('statTotalWorkouts').textContent = totalWorkouts;
    document.getElementById('statTotalVolume').textContent = `${totalVolume.toLocaleString()} kg`;
    document.getElementById('statSquashHours').textContent = `${(totalSquashMins / 60).toFixed(1)} 小時`;
    document.getElementById('statCurrentStreak').textContent = `${Math.ceil(totalWorkouts / 2)} 週`;

    const container = document.getElementById('historyLogsContainer');
    if (totalWorkouts === 0) {
      container.innerHTML = '<div class="empty-state">尚無訓練紀錄，快去完成今天的第一場訓練吧！💪</div>';
      return;
    }

    container.innerHTML = history.map(item => {
      if (item.type === 'squash') {
        return `
          <div class="history-item-card squash-card">
            <div class="history-item-info">
              <strong>${item.date} · ${item.dayType}</strong>
              <span>時長 ${item.duration} 分鐘 | 燃燒 ~${item.caloriesBurned} kcal | ${item.jointStatus}</span>
              ${item.notes ? `<p style="font-size:0.8rem; color:#f472b6; margin-top:4px;">🏸 ${item.notes}</p>` : ''}
            </div>
            <div class="history-item-badges">
              <span class="tag-badge squash-tag">壁球 60min</span>
              <span class="tag-badge equip">RPE ${item.rpe}</span>
              <button class="btn btn-outline btn-sm delete-history-item" data-id="${item.id}" title="刪除此筆">&times;</button>
            </div>
          </div>
        `;
      }

      if (item.type === 'mobility') {
        return `
          <div class="history-item-card mobility-card" style="border-left-color: #06b6d4;">
            <div class="history-item-info">
              <strong style="color:#22d3ee;">${item.date} · ${item.dayType}</strong>
              <span>${item.phaseName || ''} | 完成 ${item.completedCount || 5} 個徒手伸展動作 | 放鬆感受 ${item.feel || 9}/10 分</span>
              ${item.notes ? `<p style="font-size:0.8rem; color:#67e8f9; margin-top:4px;">🧘 ${item.notes}</p>` : ''}
            </div>
            <div class="history-item-badges">
              <span class="tag-badge" style="background:rgba(6,182,212,0.2); color:#22d3ee;">筋膜放鬆</span>
              <span class="tag-badge equip">感受 ${item.feel || 9}/10</span>
              <button class="btn btn-outline btn-sm delete-history-item" data-id="${item.id}" title="刪除此筆">&times;</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="history-item-card">
          <div class="history-item-info">
            <strong>${item.date} · ${item.dayType}</strong>
            <span>${item.phaseName || ''} | 完成 ${item.completedSetsCount || 0} 組 | 總容量 ${(item.totalVolume || 0).toLocaleString()} kg</span>
            ${item.notes ? `<p style="font-size:0.8rem; color:#a5b4fc; margin-top:4px;">💬 ${item.notes}</p>` : ''}
          </div>
          <div class="history-item-badges">
            <span class="tag-badge target">${item.mood || '訓練打卡'}</span>
            <span class="tag-badge equip">RPE ${item.rpe}</span>
            <button class="btn btn-outline btn-sm delete-history-item" data-id="${item.id}" title="刪除此筆">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind delete single history item
    container.querySelectorAll('.delete-history-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        let hist = getHistory().filter(h => h.id !== id);
        localStorage.setItem('fitlog_history', JSON.stringify(hist));
        if (supabase) {
          supabase.from('fitlog_history').delete().eq('id', id).then(({ error }) => {
            if (error) console.warn('Supabase delete error:', error);
          });
        }
        renderHistory();
        renderHeatmap();
        showToast('已刪除該筆紀錄');
      });
    });
  }

  function clearHistory() {
    if (confirm('確定要清空所有歷史訓練紀錄嗎？此動作無法復原！')) {
      localStorage.removeItem('fitlog_history');
      if (supabase) {
        supabase.from('fitlog_history').delete().neq('id', 'placeholder').then(({ error }) => {
          if (error) console.warn('Supabase clear error:', error);
        });
      }
      renderHistory();
      renderHeatmap();
      showToast('所有歷史紀錄已清空');
    }
  }

  // --- ANATOMICAL MUSCLE HEATMAP ENGINE ---
  function renderHeatmap() {
    const history = getHistory();
    const now = new Date();
    const rangeDays = state.heatmapRange === 'all' ? 9999 : parseInt(state.heatmapRange, 10);

    // Filter history in time window
    const filteredHistory = history.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      return diffDays <= rangeDays;
    });

    // Tally muscle stats: { sets: number, volume: number, exercises: Set<string> }
    const muscleStats = {
      chest: { sets: 0, volume: 0, exercises: new Set() },
      back: { sets: 0, volume: 0, exercises: new Set() },
      delts: { sets: 0, volume: 0, exercises: new Set() },
      biceps: { sets: 0, volume: 0, exercises: new Set() },
      triceps: { sets: 0, volume: 0, exercises: new Set() },
      forearms: { sets: 0, volume: 0, exercises: new Set() },
      abs: { sets: 0, volume: 0, exercises: new Set() },
      quads: { sets: 0, volume: 0, exercises: new Set() },
      hamstrings: { sets: 0, volume: 0, exercises: new Set() },
      glutes: { sets: 0, volume: 0, exercises: new Set() },
      calves: { sets: 0, volume: 0, exercises: new Set() },
      lower_back: { sets: 0, volume: 0, exercises: new Set() }
    };

    let totalUpperSets = 0;
    let totalLowerSets = 0;
    let totalSquashSessions = 0;

    filteredHistory.forEach(session => {
      if (session.type === 'squash') {
        totalSquashSessions++;
        // Squash activates: quads, glutes, hamstrings, calves, abs, forearms
        const squashSetsEquivalent = 4; // Equal to 4 high-intensity explosive sets
        ['quads', 'glutes', 'hamstrings', 'calves', 'abs', 'forearms'].forEach(m => {
          muscleStats[m].sets += squashSetsEquivalent;
          muscleStats[m].exercises.add(`🏸 週末壁球 60分鐘 (${session.date})`);
        });
      } else if (session.exercises && Array.isArray(session.exercises)) {
        session.exercises.forEach(ex => {
          let mKey = ex.muscleGroup;
          // Fallback map if needed
          if (!mKey) {
            const t = (ex.target || '').toLowerCase();
            if (t.includes('chest') || t.includes('pectorals')) mKey = 'chest';
            else if (t.includes('back') || t.includes('lats')) mKey = 'back';
            else if (t.includes('delt') || t.includes('shoulder')) mKey = 'delts';
            else if (t.includes('biceps')) mKey = 'biceps';
            else if (t.includes('triceps')) mKey = 'triceps';
            else if (t.includes('quad')) mKey = 'quads';
            else if (t.includes('hamstring')) mKey = 'hamstrings';
            else if (t.includes('glute')) mKey = 'glutes';
            else if (t.includes('calf') || t.includes('calves')) mKey = 'calves';
            else if (t.includes('abs') || t.includes('waist')) mKey = 'abs';
            else mKey = 'chest';
          }

          if (muscleStats[mKey]) {
            const setsCount = (ex.sets || []).length;
            muscleStats[mKey].sets += setsCount;
            let exVol = 0;
            (ex.sets || []).forEach(s => exVol += ((s.weight || 0) * (s.reps || 0)));
            muscleStats[mKey].volume += exVol;
            muscleStats[mKey].exercises.add(ex.name);

            // Upper vs Lower balance tally
            if (['chest', 'back', 'delts', 'biceps', 'triceps', 'forearms'].includes(mKey)) {
              totalUpperSets += setsCount;
            } else {
              totalLowerSets += setsCount;
            }
          }
        });
      }
    });

    state.computedMuscleStats = muscleStats;

    // Apply heat colors to SVG paths
    document.querySelectorAll('.muscle-node').forEach(node => {
      const muscleKey = node.dataset.muscle;
      const data = muscleStats[muscleKey] || { sets: 0 };
      const sets = data.sets;

      // Remove existing heat classes
      node.classList.remove('heat-none', 'heat-low', 'heat-mid', 'heat-high');

      if (sets === 0) {
        node.classList.add('heat-none');
      } else if (sets <= 4) {
        node.classList.add('heat-low');
      } else if (sets <= 9) {
        node.classList.add('heat-mid');
      } else {
        node.classList.add('heat-high');
      }
    });

    // Update Balance Bars
    const totalActivity = totalUpperSets + totalLowerSets + (totalSquashSessions * 6);
    if (totalActivity > 0) {
      const uPct = Math.round((totalUpperSets / totalActivity) * 100);
      const lPct = Math.round((totalLowerSets / totalActivity) * 100);
      const sPct = 100 - uPct - lPct;

      document.getElementById('upperPct').textContent = `${uPct}%`;
      document.getElementById('upperBar').style.width = `${uPct}%`;

      document.getElementById('lowerPct').textContent = `${lPct}%`;
      document.getElementById('lowerBar').style.width = `${lPct}%`;

      document.getElementById('squashPct').textContent = `${Math.max(0, sPct)}%`;
      document.getElementById('squashBar').style.width = `${Math.max(0, sPct)}%`;
    } else {
      document.getElementById('upperPct').textContent = '0%';
      document.getElementById('upperBar').style.width = '0%';
      document.getElementById('lowerPct').textContent = '0%';
      document.getElementById('lowerBar').style.width = '0%';
      document.getElementById('squashPct').textContent = '0%';
      document.getElementById('squashBar').style.width = '0%';
    }

    // Default select quads or chest if not selected
    if (state.selectedMuscle) {
      selectMuscleDetail(state.selectedMuscle);
    } else {
      selectMuscleDetail('quads');
    }
  }

  function selectMuscleDetail(muscleKey) {
    state.selectedMuscle = muscleKey;
    const stats = state.computedMuscleStats ? state.computedMuscleStats[muscleKey] : null;
    const zhName = MUSCLE_NAMES_ZH[muscleKey] || muscleKey;

    document.getElementById('selectedMuscleName').textContent = zhName;
    
    let tagText = '未鍛鍊 (0組)';
    if (stats && stats.sets > 0) {
      if (stats.sets <= 4) tagText = '輕度適應區 (1-4組)';
      else if (stats.sets <= 9) tagText = '主力受刺激區 (5-9組)';
      else tagText = '高強度熱區 (10+組)';
    }
    document.getElementById('selectedMuscleTag').textContent = tagText;
    document.getElementById('selectedMuscleSets').textContent = `${stats ? stats.sets : 0} 組`;
    document.getElementById('selectedMuscleVolume').textContent = `${stats ? stats.volume.toLocaleString() : 0} kg`;

    const exList = document.getElementById('selectedMuscleExercises');
    if (stats && stats.exercises && stats.exercises.size > 0) {
      exList.innerHTML = Array.from(stats.exercises).map(name => `
        <li>
          <span>${name}</span>
        </li>
      `).join('');
    } else {
      exList.innerHTML = '<li class="empty-hint">在所選時間區間內尚未有針對該部位的訓練紀錄。</li>';
    }
  }

  // --- EXERCISE MODAL (SINGLE EXERCISE DETAILS) ---
  function openExerciseModal(exerciseId) {
    const dbItem = window.EXERCISES_DB ? window.EXERCISES_DB.find(item => item.id === exerciseId) : null;
    const modal = document.getElementById('exerciseModal');
    const body = document.getElementById('modalBody');

    if (!dbItem) {
      body.innerHTML = `
        <div class="exercise-modal-view">
          <h3>動作代碼: ${exerciseId}</h3>
          <p>正在載入詳細動作資訊...</p>
        </div>
      `;
      modal.classList.remove('hidden');
      return;
    }

    const steps = dbItem.instruction_steps_zh && dbItem.instruction_steps_zh.length > 0
      ? dbItem.instruction_steps_zh
      : (dbItem.instructions_zh ? [dbItem.instructions_zh] : ['請保持腹部核心穩定，遵循標準運動軌跡執行。']);

    body.innerHTML = `
      <div class="exercise-modal-view">
        <div class="exercise-modal-media-wrapper">
          <img src="${dbItem.gif_url}" alt="${dbItem.name}" class="exercise-modal-gif" onerror="this.src='${dbItem.image}'">
        </div>
        <div class="exercise-modal-details">
          <h3>${dbItem.name}</h3>
          <div class="exercise-modal-badges">
            <span class="tag-badge target">目標: ${dbItem.target}</span>
            <span class="tag-badge equip">器材: ${dbItem.equipment}</span>
            <span class="tag-badge">部位: ${dbItem.body_part}</span>
          </div>

          <h4 style="font-size: 0.95rem; color: #fff; margin-top: 0.85rem;">📋 動作步驟指引 (Instructions)</h4>
          <ol class="steps-list">
            ${steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  // --- LIBRARY MODAL (1,324+ EXERCISES SEARCH) ---
  function openLibraryModal() {
    document.getElementById('libraryModal').classList.remove('hidden');
    filterLibrary();
  }

  function filterLibrary() {
    const query = (document.getElementById('librarySearchInput').value || '').toLowerCase().trim();
    const bodyPart = document.getElementById('bodyPartFilter').value;
    const grid = document.getElementById('libraryGrid');

    if (!window.EXERCISES_DB) {
      grid.innerHTML = '<div style="color:#9ca3af; padding:1rem;">動作庫資料載入中...</div>';
      return;
    }

    const filtered = window.EXERCISES_DB.filter(e => {
      let matchPart = false;
      if (bodyPart === 'all') {
        matchPart = true;
      } else if (bodyPart === 'mobility') {
        matchPart = MOBILITY_EXERCISES_DB.some(m => m.id === e.id) || e.name.toLowerCase().includes('stretch');
      } else {
        matchPart = e.body_part.toLowerCase() === bodyPart.toLowerCase();
      }

      const matchText = !query || 
        e.name.toLowerCase().includes(query) || 
        e.target.toLowerCase().includes(query) ||
        (e.instructions_zh && e.instructions_zh.toLowerCase().includes(query));
      return matchPart && matchText;
    }).slice(0, 60);

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="color:#9ca3af; padding:2rem; grid-column:1/-1; text-align:center;">找不到相符的動作，請嘗試其他關鍵字。</div>';
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <div class="library-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://placehold.co/70x70/1a1f2c/ffffff?text=FIT'">
        <h5>${item.name}</h5>
        <span>${item.target} · ${item.equipment}</span>
      </div>
    `).join('');

    grid.querySelectorAll('.library-card').forEach(card => {
      card.addEventListener('click', () => {
        openExerciseModal(card.dataset.id);
      });
    });
  }

  // --- EXPORT DATA ---
  function exportData() {
    const history = getHistory();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fitlog_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('匯出備份檔案成功！');
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Kickstart App on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
})();
