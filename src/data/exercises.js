(function (root) {
  'use strict';

  // skill: 'high'이면 50세 이상에게는 alt(더 안전한 대체 운동)로 바꿔 추천한다.
  // timed: true이면 반복 수 대신 유지 시간으로 표기한다.
  var LIST = [
    // 하체
    { id: 'barbell_squat', name: '바벨 스쿼트', group: 'legs', skill: 'high', alt: 'goblet_squat' },
    { id: 'goblet_squat', name: '고블릿 스쿼트', group: 'legs' },
    { id: 'leg_press', name: '레그 프레스', group: 'legs' },
    { id: 'rdl', name: '덤벨 루마니안 데드리프트', group: 'legs' },
    { id: 'leg_curl', name: '레그 컬', group: 'legs' },
    { id: 'leg_extension', name: '레그 익스텐션', group: 'legs' },
    { id: 'lunge', name: '덤벨 런지', group: 'legs', skill: 'high', alt: 'glute_bridge' },
    { id: 'hip_thrust', name: '힙 쓰러스트', group: 'legs' },
    { id: 'glute_bridge', name: '글루트 브릿지', group: 'legs' },
    { id: 'calf_raise', name: '카프 레이즈', group: 'legs' },
    // 가슴
    { id: 'bench_press', name: '바벨 벤치프레스', group: 'chest', skill: 'high', alt: 'chest_press_machine' },
    { id: 'chest_press_machine', name: '체스트 프레스 머신', group: 'chest' },
    { id: 'incline_db_press', name: '인클라인 덤벨 프레스', group: 'chest' },
    { id: 'cable_fly', name: '케이블 플라이', group: 'chest' },
    { id: 'pushup', name: '푸시업(무릎 대고 시작 가능)', group: 'chest' },
    // 등
    { id: 'pullup', name: '풀업(어시스트 포함)', group: 'back', skill: 'high', alt: 'lat_pulldown' },
    { id: 'lat_pulldown', name: '랫 풀다운', group: 'back' },
    { id: 'seated_row', name: '시티드 케이블 로우', group: 'back' },
    { id: 'one_arm_row', name: '원암 덤벨 로우', group: 'back' },
    { id: 'face_pull', name: '페이스 풀', group: 'back' },
    // 어깨
    { id: 'shoulder_press_machine', name: '머신 숄더 프레스', group: 'shoulders' },
    { id: 'db_shoulder_press', name: '덤벨 숄더 프레스', group: 'shoulders' },
    { id: 'lateral_raise', name: '사이드 레터럴 레이즈', group: 'shoulders' },
    { id: 'rear_delt_fly', name: '리어 델트 플라이', group: 'shoulders' },
    // 팔
    { id: 'db_curl', name: '덤벨 컬', group: 'arms' },
    { id: 'hammer_curl', name: '해머 컬', group: 'arms' },
    { id: 'triceps_pushdown', name: '트라이셉스 푸시다운', group: 'arms' },
    { id: 'overhead_triceps', name: '오버헤드 트라이셉스 익스텐션', group: 'arms' },
    // 코어
    { id: 'plank', name: '플랭크', group: 'core', timed: true },
    { id: 'dead_bug', name: '데드버그', group: 'core' },
    { id: 'bird_dog', name: '버드독', group: 'core' },
    { id: 'cable_crunch', name: '케이블 크런치', group: 'core' },
    { id: 'hanging_leg_raise', name: '행잉 레그 레이즈', group: 'core', skill: 'high', alt: 'dead_bug' }
  ];

  var BY_ID = {};
  LIST.forEach(function (e) { BY_ID[e.id] = e; });

  root.Fit = root.Fit || {};
  root.Fit.exercises = { list: LIST, byId: BY_ID };
})(typeof window !== 'undefined' ? window : globalThis);
