export type Language = 'zh' | 'en';

export interface Translations {
  categories: string;
  all: string;
  black: string;
  white: string;
  previous: string;
  next: string;
  back: string;
  manage: string;
  posts: string;
  settings: string;
  newPost: string;
  edit: string;
  delete: string;
  cancel: string;
  create: string;
  update: string;
  title: string;
  content: string;
  category: string;
  blogTitle: string;
  authorName: string;
  authorBio: string;
  email: string;
  avatar: string;
  saveSettings: string;
  noPosts: string;
  postNotFound: string;
  search: string;
  searching: string;
  noResults: string;
  enableComments: string;
  enableLikes: string;
  enableViews: string;
  comments: string;
  likes: string;
  views: string;
  addComment: string;
  submit: string;
  noComments: string;
  blogSubtitle: string;
  confirmDelete: string;
  deleteConfirmMessage: string;
  confirm: string;
  adminUsername: string;
  adminPassword: string;
  updateCredentials: string;
  logout: string;
  hidePreview: string;
  showPreview: string;
  preview: string;
  untitled: string;
  startTyping: string;
  exitSettings: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    categories: '分类',
    all: '全部',
    black: '黑',
    white: '白',
    previous: '上一页',
    next: '下一页',
    back: '返回',
    manage: '管理',
    posts: '文章',
    settings: '设置',
    newPost: '新建文章',
    edit: '编辑',
    delete: '删除',
    cancel: '取消',
    create: '创建',
    update: '更新',
    title: '标题',
    content: '内容',
    category: '分类',
    blogTitle: '博客标题',
    authorName: '作者姓名',
    authorBio: '作者简介',
    email: '邮箱',
    avatar: '头像',
    saveSettings: '保存设置',
    noPosts: '暂无文章',
    postNotFound: '文章未找到',
    search: '搜索...',
    searching: '搜索中...',
    noResults: '未找到结果',
    enableComments: '开启评论',
    enableLikes: '开启点赞',
    enableViews: '开启浏览量',
    comments: '评论',
    likes: '点赞',
    views: '浏览量',
    addComment: '添加评论',
    submit: '提交',
    noComments: '暂无评论',
    blogSubtitle: '博客副标题',
    confirmDelete: '确认删除',
    deleteConfirmMessage: '确定要删除这篇文章吗？此操作无法撤销。',
    confirm: '确认',
    adminUsername: '管理员用户名',
    adminPassword: '管理员密码',
    updateCredentials: '更新账号密码',
    logout: '退出登录',
    hidePreview: '隐藏预览',
    showPreview: '显示预览',
    preview: '预览',
    untitled: '未命名',
    startTyping: '开始输入以查看预览...',
    exitSettings: '退出设置',
  },
  en: {
    categories: 'Categories',
    all: 'All',
    black: 'black',
    white: 'white',
    previous: 'Previous',
    next: 'Next',
    back: 'Back',
    manage: 'Manage',
    posts: 'Posts',
    settings: 'Settings',
    newPost: 'New Post',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    title: 'Title',
    content: 'Content',
    category: 'Category',
    blogTitle: 'Blog Title',
    authorName: 'Author Name',
    authorBio: 'Author Bio',
    email: 'Email',
    avatar: 'Avatar',
    saveSettings: 'Save Settings',
    noPosts: 'No posts yet.',
    postNotFound: 'Post not found',
    search: 'Search...',
    searching: 'Searching...',
    noResults: 'No results found',
    enableComments: 'Enable Comments',
    enableLikes: 'Enable Likes',
    enableViews: 'Enable Views',
    comments: 'Comments',
    likes: 'Likes',
    views: 'Views',
    addComment: 'Add Comment',
    submit: 'Submit',
    noComments: 'No comments yet',
    blogSubtitle: 'Blog Subtitle',
    confirmDelete: 'Confirm Delete',
    deleteConfirmMessage: 'Are you sure you want to delete this post? This action cannot be undone.',
    confirm: 'Confirm',
    adminUsername: 'Admin Username',
    adminPassword: 'Admin Password',
    updateCredentials: 'Update Credentials',
    logout: 'Logout',
    hidePreview: 'Hide Preview',
    showPreview: 'Show Preview',
    preview: 'Preview',
    untitled: 'Untitled',
    startTyping: 'Start typing to see preview...',
    exitSettings: 'Exit Settings',
  },
};

export function getTranslations(lang: Language = 'en'): Translations {
  return translations[lang] || translations.en;
}
