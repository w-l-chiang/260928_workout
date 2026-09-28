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
      description: '自重動作與輕量啞鈴為主，建立動作控制與關節適應，週末搭配 1 小時壁球。',
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
        }
      ]
    },

    2: {
      name: 'Phase 2 : 中級肌力建立期 (Week 5-8)',
      description: '增加負荷與單側控制，著重離心慢放（2-3秒），強化壁球衝刺煞車所需的腿部肌力。',
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
        }
      ]
    },

    3: {
      name: 'Phase 3 : 強化突破期 (Week 9-12)',
      description: '多關節槓鈴/重啞鈴複合發力，挑戰漸進超負荷與極致爆發力。',
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
          name: 'Dumbbell Lateral Raise (側平舉)',
          target: '三角肌中束 (Side Delts)',
          muscleGroup: 'delts',
          equipment: 'dumbbell',
          defaultSets: 3,
          targetReps: '12-15',
          suggestedWeight: 4,
          notes: '雕塑立體南瓜肩與強化後肩肩袖健康。'
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
          id: '0687',
          name: 'Russian Twist (俄羅斯轉體)',
          target: '腹內外斜肌 / 核心 (Abs & Obliques)',
          muscleGroup: 'abs',
          equipment: 'body weight / dumbbell',
          defaultSets: 3,
          targetReps: '20次 (每邊10)',
          suggestedWeight: 2,
          notes: '旋轉軀幹帶動雙手觸碰兩側地面。'
        }
      ]
    }
  };

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
    currentDay: 'upper', // 'upper', 'lower', 'squash'
    currentExercises: [],
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

  // --- INITIALIZATION ---
  function init() {
    loadSavedSettings();
    setupDatesToday();
    bindEvents();
    renderCurrentWorkout();
    renderHistory();
    renderHeatmap();
    syncWithSupabase();
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
    if (dateInput) dateInput.value = today;
    if (squashDateInput) squashDateInput.value = today;
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

    // Day Switcher (Upper / Lower / Squash)
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

    // Squash RPE Slider
    const squashRpeSlider = document.getElementById('squashRpe');
    const squashRpeLabel = document.getElementById('squashRpeValue');
    squashRpeSlider.addEventListener('input', () => {
      const val = parseInt(squashRpeSlider.value, 10);
      let desc = '';
      if (val <= 6) desc = '輕鬆練球 / 步伐熱身';
      else if (val <= 7) desc = '中度心肺對打 (微喘)';
      else if (val === 8) desc = '高強度心肺，呼吸急促汗流浹背';
      else desc = '極高強度對抗賽 / 體能極限燃燒';
      squashRpeLabel.textContent = `RPE ${val} (${desc})`;
    });

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

    // Export & Clear History
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
  }

  // --- WORKOUT RENDERING ---
  function renderCurrentWorkout() {
    const isSquash = state.currentDay === 'squash';

    const strengthGrid = document.getElementById('strengthWorkoutGrid');
    const squashView = document.getElementById('squashWorkoutView');
    const strengthStatsBar = document.getElementById('strengthStatsBar');
    const restTimerWidget = document.getElementById('restTimerWidget');

    if (isSquash) {
      strengthGrid.style.display = 'none';
      strengthStatsBar.style.display = 'none';
      restTimerWidget.style.display = 'none';
      squashView.classList.remove('hidden');
      return;
    } else {
      strengthGrid.style.display = 'grid';
      strengthStatsBar.style.display = 'flex';
      restTimerWidget.style.display = 'flex';
      squashView.classList.add('hidden');
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
      const matchPart = bodyPart === 'all' || e.body_part.toLowerCase() === bodyPart.toLowerCase();
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
