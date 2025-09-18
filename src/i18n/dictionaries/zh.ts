const zh = {
  // Generic
  "home": "主页",
  "search": "搜索",
  "preview": "预览",
  "delete.action": "删除",
  "delete.deleting": "正在删除…",
  "delete.confirm": "确定要删除“{name}”吗？此操作会将该项移动到回收站。",
  "delete.error": "删除失败：{message}",
  "folder.create": "新建文件夹",
  "folder.creating": "正在创建…",
  "folder.prompt": "请输入新文件夹名称",
  "folder.error": "新建文件夹失败：{message}",
  "logout": "退出登录",
  "logout.loading": "正在退出…",
  "logout.error": "退出失败：{message}",

  // Navbar
  "search.placeholder": "搜索文件...",

  // Root/page
  "drive.personal": "OneDrive 个人网盘",
  "drive.business": "OneDrive 商业版网盘",
  "error.onedrive": "无法读取 OneDrive 数据：{message}",

  // Breadcrumbs
  "breadcrumbs.unknown": "[未知文件夹]",

  // Files page
  "page.files.title": "文件",

  // Search
  "search.results": "搜索结果：{query}",
  "search.loading": "搜索中",
  "search.input.placeholder": "搜索文件或文件夹...",
  "search.tip.enter": "请输入搜索关键字。",
  "search.tip.none": "没有找到匹配的结果。",
  "filter.all": "全部",
  "filter.folders": "文件夹",
  "filter.files": "文件",
  "filter.images": "图片",
  "filter.audio": "音频",
  "filter.text": "文本",
  "filter.markdown": "Markdown",
  "sort.label": "排序",
  "sort.relevance": "相关性（原顺序）",
  "sort.date_desc": "最近修改",
  "sort.date_asc": "最早修改",
  "sort.name_asc": "名称 A → Z",
  "sort.size_desc": "大小 从大到小",
  "sort.size_asc": "大小 从小到大",

  // Login
  "login.heading": "账户登录",
  "login.subtitle": "请输入管理员密码以访问",
  "login.password.label": "密码",
  "login.password.placeholder": "请输入管理员密码",
  "login.button": "登录",
  "login.error.invalid": "密码错误，请重试",
  "login.error.generic": "登录过程中发生错误",

  // Setup
  "setup.head.title": "OneDriveList - 首次运行设置",
  "setup.head.description": "OneDriveList 首次运行设置页面",
  "setup.title": "首次运行设置",
  "setup.missing": "尚未检测到 {token} 环境变量。",
  "setup.instruction": "请登录您的 Microsoft 账号以生成 Refresh Token。",
  "setup.login.button": "安全登录 Microsoft 账户",

  // Not Found
  "notfound.badge": "页面未找到",
  "notfound.title": "看起来您迷路了",
  "notfound.desc": "您访问的页面不存在或已被移动。让我们帮您找到正确的方向。",
  "notfound.home": "返回首页",
  "notfound.refresh": "刷新页面",
  "notfound.help": "需要帮助？",
  "notfound.docs": "查看文档",
  "notfound.contact": "联系支持",

  // Token
  "token.success": "获取 Refresh Token 成功",
  "token.failure": "获取 Refresh Token 失败",
  "token.success.instruction": "请复制下面的 Refresh Token，并在部署平台的环境变量中设置 {token}",
  "token.failure.instruction": "未能获取到 Refresh Token，请返回重试。",
  "token.back": "返回重试",

  // Copy
  "copy.copied": "已复制",
  "copy.copy": "复制",
};

export default zh;
