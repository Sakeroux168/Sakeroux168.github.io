/*
 * ===== 网站的全部内容都在这个文件里 =====
 * 改文字、加软件、换价格，只需要改这里，不用碰别的文件。
 * 图片放到 images/ 文件夹，路径写对就行。
 */
window.SITE = {
  shop: "软件杂货铺",   // 店名：显示在导航、首页大标题、浏览器标签上
  name: "颜如玉",       // 你的名字
  tagline: "自媒体矩阵运营的效率工具 · 批量发布、视频处理、AI 取标题",
  intro: "我是颜如玉，专做自媒体矩阵运营用的小工具：多账号批量发视频、给视频起标题、整理素材。都是我自己天天在用、一版一版磨出来的。先免费试用，好用再买，也接定制。",
  avatar: "images/avatar.png",   // 头像：放一张正方形图片到 images/avatar.png；没放时显示「颜」字

  // 首页那条斜着滚动的字幕
  marquee: ["多账号批量发布", "AI 起标题", "视频去水印", "素材整理", "先试后买", "童叟无欺", "售后包教会", "接受定做"],

  // 开源区：现在先关着。以后想展示 GitHub 项目，把 false 改成 true
  showOpenSource: false,
  github: "Sakeroux168",
  pinRepos: [],
  hideRepos: [],
  repoLimit: 6,

  contact: {
    wechat: "chawen6666",
    wechatQr: "",          // 以后放微信二维码：图片放到 images/wechat-qr.png，这里填 "images/wechat-qr.png"
    qqGroup: "",
    email: ""
  },

  // 收款方式：现在都还没放，买东西会提示「加微信付款」
  // 以后放收款码：图片放进 images/，取消下面对应行前面的 // 即可
  pay: {
    // wechat: "images/pay-wechat.png",   // 微信「个人经营收款码」
    // alipay: "images/pay-alipay.png",   // 支付宝收款码
    // afdian: "https://afdian.com/a/你的ID",
    // usdt: { network: "TRC20", address: "你的地址" }
  },

  products: [
    {
      id: "baijiahao",
      name: "百家号视频发布助手",
      icon: "百",
      status: "在售",
      summary: "几十上百个百家号一起管：批量发视频、自动去水印、查重、改标题、查后台，矩阵号运营一个人就够。",
      tags: ["Windows", "多账号矩阵", "批量发布", "去水印"],
      bilibili: "",   // 有演示视频就传到 B 站，把 BV 号填这里
      features: [
        { title: "多账号批量发布", desc: "账号、Cookie、视频目录、分类、标签、话题一次配好，几百个号轮流自动发。" },
        { title: "自动去水印", desc: "框一次水印位置，之后每条视频发之前自动去掉，抖音换位置的水印也能多框几处。" },
        { title: "视频查重", desc: "按画面认出同一条视频，换了标题重新下载的也逃不掉；发过的不会再发。" },
        { title: "剪辑和预览", desc: "软件里直接预览、剪掉片头片尾，剪坏了一键撤销。" },
        { title: "AI 改标题", desc: "贴着原标题改写，自动避开「震惊」「速看」这类违规词，长短合适。" },
        { title: "查后台", desc: "一键看每个号今天发了几条、有没有定时、有没有被打回。" },
        { title: "和视频爬取工具打通", desc: "爬取工具抓的素材自动进各号的暂存，发完自动标「已用」。" },
        { title: "兼容老软件", desc: "能直接导入老版本的账号备份和已发记录，换过来不用重新配。" }
      ],
      plans: [
        { name: "试用", price: 0, desc: "全部功能免费用 3 天" },
        { name: "月付", price: 59, unit: "/月", desc: "按月续费，随时停" },
        { name: "年付", price: 399, unit: "/年", desc: "相当于每月 33 元，免费更新", highlight: true },
        { name: "买断", price: 799, unit: "永久", desc: "一次付款，永久使用，免费更新" }
      ],
      downloads: [{ label: "加微信获取安装包", url: "index.html#contact" }],
      changelog: [
        { version: "108", date: "2026-10-07", notes: "手发号也能查后台了（借创作罐头），被打回的作品清单会自动清理" },
        { version: "107", date: "2026-10", notes: "修复末尾带零碎数据的好视频被误判成坏视频" },
        { version: "106", date: "2026-10", notes: "去水印每条必做、模糊加重；和视频爬取工具联动：只抓热门、抓完再记日期、发完标已用" },
        { version: "105", date: "2026-09", notes: "口播类视频不再互相误判成同一条" }
      ],
      faq: [
        { q: "能管多少个账号？", a: "没有硬性上限，我自己用它管着几百个号。账号越多，建议电脑配置越好。" },
        { q: "以前用的是老版本，数据能带过来吗？", a: "能。直接导入老软件的「帐号备份.txt」，已发记录格式也一样，两边去重互通。" },
        { q: "一个激活码能用几台电脑？", a: "1 台。换电脑时把新机器码发给我，重新发码。" },
        { q: "会不会封号？", a: "软件按正常节奏操作，但请控制发布频率、遵守平台规则，账号风险以平台为准。" }
      ]
    },
    {
      id: "ainame",
      name: "AI 视频取标题",
      icon: "题",
      status: "在售",
      summary: "把视频拖进来，AI 听内容、看画面，给你几个好标题，挑一个就自动改好文件名。",
      tags: ["Windows", "AI", "批量改名"],
      features: [
        { title: "拖进来就能用", desc: "单个视频、整个文件夹都能拖，几百条一起处理。" },
        { title: "听、看、读三种方式", desc: "读文件名、听视频里说的话、看画面，四种模式按需选。" },
        { title: "语音识别在本机跑", desc: "听内容用的模型在你电脑上运行，不花钱、不上传你的视频。" },
        { title: "多种标题风格", desc: "给出多个候选，挑一个就自动改文件名。" },
        { title: "随时撤销", desc: "改错了一键改回原名。" }
      ],
      plans: [
        { name: "试用", price: 0, desc: "全部功能免费用 3 天" },
        { name: "月付", price: 19, unit: "/月", desc: "按月续费，随时停" },
        { name: "买断", price: 149, unit: "永久", desc: "一次付款，永久使用，免费更新", highlight: true }
      ],
      downloads: [{ label: "加微信获取安装包", url: "index.html#contact" }],
      changelog: [
        { version: "0.2.0", date: "2026-07-31", notes: "当前版本" }
      ],
      faq: [
        { q: "要另外花钱吗？", a: "生成标题要用 DeepSeek 或阿里百炼的 AI 接口，需要你自己注册一个 Key，按用量付费，起标题非常便宜。" },
        { q: "会上传我的视频吗？", a: "不会。语音识别在本机完成，只把文字发给 AI 生成标题。" },
        { q: "一个激活码能用几台电脑？", a: "1 台。换电脑时把新机器码发给我，重新发码。" }
      ]
    },
    {
      id: "video-tools",
      name: "视频运营工具箱",
      icon: "箱",
      status: "在售",
      summary: "B 站链接批量提取、标题标签抓取、本地视频自动贴标签、剪辑前后批量还原标题，四件套一次买齐。",
      tags: ["Windows", "B 站", "批量改名"],
      features: [
        { title: "一键提取链接", desc: "在 B 站视频列表页，按日期范围一键提取所有视频链接。" },
        { title: "抓标题和标签", desc: "按链接批量抓取视频的完整标题和热门标签，自带防封延时。" },
        { title: "自动贴标签", desc: "把抓到的标签自动对上本地视频，写进文件名，改之前先给你预览。" },
        { title: "剪辑后还原标题", desc: "剪完只剩序号的视频，一键改回原来的长标题。" }
      ],
      plans: [
        { name: "买断", price: 39, unit: "永久", desc: "四个工具全给，一次付款，永久使用", highlight: true }
      ],
      downloads: [{ label: "加微信获取", url: "index.html#contact" }],
      changelog: [],
      faq: [
        { q: "需要会编程吗？", a: "不需要，买了之后我教你怎么用。" }
      ]
    },
    {
      id: "video-scraper",
      name: "视频爬取工具",
      icon: "爬",
      status: "免费",
      summary: "批量抓取抖音、快手、小红书的视频信息并下载原视频，按作者追更、素材库管理，免费使用。",
      tags: ["Windows", "抖音", "快手", "小红书"],
      features: [
        { title: "三种抓法", desc: "按关键词、作者主页、话题抓，作者主页支持按日期段和只抓新视频。" },
        { title: "下载原视频", desc: "不重新压缩，支持暂停继续、失败重试，显示进度和速度。" },
        { title: "作者追更", desc: "批量导入作者名单，每天定时自动追更。" },
        { title: "素材库", desc: "看封面挑视频，打星标、标已用、写备注，一键打包交付。" },
        { title: "后台运行", desc: "缩到托盘里跑，抓完或需要登录时弹通知。" }
      ],
      plans: [
        { name: "免费", price: 0, desc: "免费使用。觉得好用，可以请我喝杯咖啡" }
      ],
      downloads: [{ label: "加微信获取安装包", url: "index.html#contact" }],
      changelog: [],
      faq: [
        { q: "真的免费吗？", a: "真的免费，不用激活码。" },
        { q: "下载的视频能直接拿去发吗？", a: "视频版权归原作者和平台。仅供个人学习研究，转载、二创前请取得授权，并遵守平台规则和法律法规。" }
      ]
    },
    {
      id: "zhihu-video",
      name: "知乎视频发布助手",
      icon: "知",
      status: "开发中",
      summary: "知乎达人账号的视频自动发布工具，和百家号助手一样的批量玩法。",
      tags: ["Windows", "知乎", "批量发布"],
      features: [
        { title: "多账号自动发视频", desc: "知乎达人账号批量发布视频。" }
      ],
      plans: [
        { name: "内测预约", price: null, desc: "正在开发中，想第一时间用上可以加微信预约内测" }
      ],
      downloads: [],
      changelog: [],
      faq: []
    },
    {
      id: "subtitle",
      name: "多语言字幕翻译",
      icon: "译",
      status: "开发中",
      summary: "海外短剧、漫剧字幕批量翻译成自然的简体中文。视频不出你的电脑，只发送字幕文字。",
      tags: ["Windows", "AI 翻译", "短剧"],
      features: [
        { title: "多语言", desc: "英、日、韩、越南语等字幕翻译成简体中文。" },
        { title: "断点续翻", desc: "失败自动重试，中途关掉下次接着翻。" },
        { title: "保留每一版", desc: "原文、初译、润色、最终稿都留着，随时对比。" }
      ],
      plans: [
        { name: "内测预约", price: null, desc: "正在开发中，想第一时间用上可以加微信预约内测" }
      ],
      downloads: [],
      changelog: [],
      faq: []
    }
  ],

  // 教程 & 公告：文章正文写在 posts/ 文件夹里的 .md 文件（Markdown 格式，用记事本就能写）
  // type 只能是 "教程" 或 "公告"；product 填软件 id，文章就会同时出现在那个软件的详情页
  posts: [
    {
      id: "baijiahao-v108",
      type: "公告",
      title: "百家号视频发布助手第 108 版：手发号也能查后台",
      date: "2026-10-07",
      product: "baijiahao",
      summary: "借创作罐头查手发号的发布数、定时和被打回情况，被打回清单也会自动清理。",
      file: "posts/baijiahao-v108.md"
    },
    {
      id: "video-scraper-free",
      type: "公告",
      title: "视频爬取工具免费开放",
      date: "2026-10-07",
      product: "video-scraper",
      summary: "抖音、快手、小红书批量抓取和下载，免费使用，加微信获取安装包。",
      file: "posts/video-scraper-free.md"
    },
    {
      id: "ainame-quickstart",
      type: "教程",
      title: "AI 视频取标题：第一次使用必看",
      date: "2026-07-31",
      product: "ainame",
      summary: "装好之后先做三件事：填 Key、下载语音模型、检查环境，然后就能批量起标题了。",
      file: "posts/ainame-quickstart.md"
    }
  ],

  // 实验室：不卖的作品、小实验、还在研发的东西
  lab: [
    { name: "AI 揭晓视频工作室（研发中）", desc: "可以自己 DIY 模板的 AI 揭晓类短视频批量生产器：描边、红笔、荧光笔三种揭晓效果。", link: "" },
    { name: "手写字揭晓短视频", desc: "批量生成手写字逐笔揭晓的短视频，主题填进表格就能连续出片。", link: "" },
    { name: "吃货日历", desc: "每周餐饮优惠攻略小应用，打开就知道今天哪家有优惠。", link: "" }
  ],

  custom: {
    intro: "现成软件不满足需求？可以按你的流程定制。",
    services: [
      { title: "多平台自动发布", desc: "百家号、知乎、头条、抖音等平台的多账号批量 / 定时发布" },
      { title: "视频批量处理", desc: "去水印、剪辑、查重、改名、统一格式，几千条一起跑" },
      { title: "AI 内容工具", desc: "AI 起标题、写文案、字幕翻译，接你自己的 AI 账号" },
      { title: "数据整理", desc: "后台数据、素材清单、运营表格的自动汇总和导出" }
    ],
    steps: ["加微信说需求", "我评估报价", "付定金开工", "交付验收", "付尾款"]
  },

  // 赞助：afdian / 微信赞赏码都还没放时，这一块会自动隐藏
  sponsor: {
    intro: "如果我的软件帮到了你，可以请我喝杯咖啡，这会让我更有动力继续更新。",
    afdian: "",
    wechatReward: ""
  }
};
