/*
 * ===== 网站的全部内容都在这个文件里 =====
 * 改文字、加软件、换价格，只需要改这里，不用碰别的文件。
 * 图片放到 images/ 文件夹，路径写对就行；图片还没放的地方会显示虚线占位框提醒你。
 * 下面的软件、价格都是示例，记得改成你自己的。
 */
window.SITE = {
  name: "你的名字",
  tagline: "独立开发者 · 做让内容创作者省时间的自动化工具",
  intro: "我做发布、采集、批量处理类的小工具，帮自媒体人把重复的活交给电脑。软件都能先试用，也接定制开发。",
  avatar: "images/avatar.png",

  // 首页那条斜着滚动的字幕
  marquee: ["批量发布", "定时任务", "数据采集", "先试后买", "定制开发", "售后包教会"],

  // 开源区：现在先关着。以后想展示 GitHub 项目，把 false 改成 true，再填上 GitHub 用户名
  showOpenSource: false,
  github: "your-github-username",
  pinRepos: [],      // 想排在最前面的仓库名，例如 ["repo-a", "repo-b"]
  hideRepos: [],     // 不想展示的仓库名
  repoLimit: 6,

  contact: {
    wechat: "your-wechat-id",
    wechatQr: "images/wechat-qr.png",
    qqGroup: "123456789",
    email: ""
  },

  // 收款方式：不用的删掉那一行即可
  pay: {
    wechat: "images/pay-wechat.png",   // 微信「个人经营收款码」
    alipay: "images/pay-alipay.png",   // 支付宝收款码
    afdian: "https://afdian.com/a/your-id",
    usdt: { network: "TRC20", address: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
  },

  products: [
    {
      id: "baijiahao",
      name: "百家号发布助手",
      icon: "百",
      status: "在售",
      summary: "批量导入文章、自动排版、定时发布到百家号，告别一篇篇手动粘贴。",
      tags: ["Windows", "批量发布", "定时任务"],
      bilibili: "",                       // 填 B 站视频 BV 号就会显示演示视频，例如 "BV1xx411c7mD"
      cover: "images/baijiahao-cover.png",
      features: [
        { title: "批量导入", desc: "Word、Markdown、TXT 一次拖进来，自动识别标题和正文。" },
        { title: "定时发布", desc: "设好时间就不用管，到点自动发。" },
        { title: "多账号", desc: "多个百家号账号切换管理，互不干扰。" },
        { title: "自动配图", desc: "按段落自动插入封面和配图。" }
      ],
      plans: [
        { name: "试用", price: 0, unit: "", desc: "全部功能免费用 3 天" },
        { name: "月付", price: 19, unit: "/月", desc: "按月续费，随时停" },
        { name: "买断", price: 99, unit: "永久", desc: "一次付款，永久使用，免费更新", highlight: true }
      ],
      downloads: [
        { label: "蓝奏云下载", url: "#" },
        { label: "123 云盘下载", url: "#" }
      ],
      changelog: [
        { version: "1.2.0", date: "2026-09-20", notes: "新增定时发布、修复图片上传失败" },
        { version: "1.0.0", date: "2026-08-01", notes: "首个版本" }
      ],
      faq: [
        { q: "一个激活码能用几台电脑？", a: "1 台。换电脑时联系我解绑即可。" },
        { q: "买断以后还收费吗？", a: "不收，后续更新都免费。" },
        { q: "会不会封号？", a: "软件模拟正常操作，但请控制发布频率，平台规则以官方为准。" }
      ]
    },
    {
      id: "zhihu",
      name: "知乎发布助手",
      icon: "知",
      status: "在售",
      summary: "文章、回答一键同步到知乎，保留格式和图片。",
      tags: ["Windows", "格式保留"],
      cover: "images/zhihu-cover.png",
      features: [
        { title: "一键同步", desc: "写一次，同步发布到知乎。" },
        { title: "格式保留", desc: "标题、加粗、列表、图片原样保留。" },
        { title: "草稿箱", desc: "可以只存草稿，确认后再发。" }
      ],
      plans: [
        { name: "试用", price: 0, desc: "免费用 3 天" },
        { name: "月付", price: 15, unit: "/月", desc: "按月续费" },
        { name: "买断", price: 79, unit: "永久", desc: "一次付款，永久使用", highlight: true }
      ],
      downloads: [{ label: "蓝奏云下载", url: "#" }],
      changelog: [{ version: "1.0.0", date: "2026-07-15", notes: "首个版本" }],
      faq: [{ q: "支持 Mac 吗？", a: "目前只支持 Windows。" }]
    },
    {
      id: "video",
      name: "视频素材采集",
      icon: "采",
      status: "内测",
      summary: "按关键词批量采集公开视频素材，自动整理归档，做二创更省事。",
      tags: ["Windows", "批量下载"],
      cover: "images/video-cover.png",
      features: [
        { title: "关键词采集", desc: "输入关键词，批量抓取公开视频信息。" },
        { title: "自动归档", desc: "按日期、来源自动分文件夹。" }
      ],
      plans: [
        { name: "内测", price: 0, desc: "内测期间免费，欢迎反馈" }
      ],
      downloads: [{ label: "加群获取内测版", url: "#contact" }],
      changelog: [],
      faq: []
    }
  ],

  // 教程 & 公告：文章正文写在 posts/ 文件夹里的 .md 文件（Markdown 格式，用记事本就能写）
  // type 只能是 "教程" 或 "公告"；product 填软件 id，文章就会同时出现在那个软件的详情页
  posts: [
    {
      id: "baijiahao-quickstart",
      type: "教程",
      title: "百家号发布助手：5 分钟上手",
      date: "2026-09-21",
      product: "baijiahao",
      summary: "从下载、激活到发出第一篇文章，一步步带你走一遍。",
      file: "posts/baijiahao-quickstart.md"
    },
    {
      id: "baijiahao-v1-2-0",
      type: "公告",
      title: "v1.2.0 更新：定时发布来了",
      date: "2026-09-20",
      product: "baijiahao",
      summary: "设好时间就不用管，到点自动发。顺手修了图片上传失败的问题。",
      file: "posts/baijiahao-v1-2-0.md"
    },
    {
      id: "zhihu-launch",
      type: "公告",
      title: "知乎发布助手正式上架",
      date: "2026-07-15",
      product: "zhihu",
      summary: "写一次，格式原样同步到知乎。前 50 位买断用户半价。",
      file: "posts/zhihu-launch.md"
    }
  ],

  // 实验室：不卖的作品、小实验、demo
  lab: [
    { name: "手写字图文生成", desc: "把文字转成手写风格的图文，适合做小红书、朋友圈配图。", link: "#", cover: "" }
  ],

  custom: {
    intro: "现成软件不满足需求？可以按你的流程定制。",
    services: [
      { title: "自动发布", desc: "百家号、知乎、头条等平台的批量 / 定时发布" },
      { title: "数据采集", desc: "公开数据的抓取、清洗、导出 Excel" },
      { title: "批量处理", desc: "图片、视频、文档的批量转换与处理" },
      { title: "小工具", desc: "把你每天重复做的事变成一个按钮" }
    ],
    steps: ["说需求", "我评估报价", "付定金开工", "交付验收", "付尾款"]
  },

  sponsor: {
    intro: "如果我的软件帮到了你，可以请我喝杯咖啡，这会让我更有动力继续更新。",
    afdian: "https://afdian.com/a/your-id",
    wechatReward: "images/wechat-reward.png"
  }
};
