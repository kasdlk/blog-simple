# Minimal Blog

A minimal, elegant blog system built with Next.js, featuring dark mode, Markdown support, and multilingual interface.

一个极简、优雅的博客系统，基于 Next.js 构建，支持暗色模式、Markdown 和多语言界面。

## Features / 功能特性

- **Minimal Design** / **极简设计** - Clean and elegant interface
- **Dark Mode** / **暗色模式** - Toggle between light and dark themes
- **Markdown Support** / **Markdown 支持** - Write posts with syntax highlighting
- **Categories** / **分类功能** - Organize posts by categories
- **Infinite Scroll** / **无限滚动** - Lazy loading for better performance
- **Search** / **搜索功能** - Search posts by title and content
- **RSS Feed** / **RSS 订阅** - Available at `/api/feed.xml`
- **Comments & Interactions** / **评论互动** - Comments, likes, and views (configurable)
- **Multilingual** / **多语言** - Support for English and Chinese
- **SQLite Database** / **SQLite 数据库** - Simple file-based database
- **Responsive Design** / **响应式设计** - Works on desktop and mobile devices
- **Admin Panel** / **管理面板** - Easy content management with authentication

## Tech Stack / 技术栈

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **SQLite3** (better-sqlite3) - Database
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub Flavored Markdown
- **rehype-highlight** - Code syntax highlighting

## Getting Started / 快速开始

### Prerequisites / 前置要求

- Node.js 18+
- npm or yarn

### Installation / 安装

```bash
# Clone the repository
git clone <repository-url>
cd blog

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

### Build for Production / 构建生产版本

```bash
npm run build
npm start
```

## Usage / 使用说明

### Admin Panel / 管理面板

Access the admin panel at `/admin` (login at `/login`):

访问管理面板 `/admin`（登录页面 `/login`）：

- Create, edit, and delete posts / 创建、编辑和删除文章
- Configure blog settings / 配置博客设置
- Manage categories / 管理分类
- Enable/disable comments, likes, views / 开启/关闭评论、点赞、浏览量
- Update admin credentials / 更新管理员凭据

**Default Login Credentials / 默认登录凭据:**
- Username / 用户名: `admin`
- Password / 密码: `123456`

**Reset Password / 重置密码:**

```bash
sqlite3 data/blog.db "UPDATE admin SET username = 'admin', passwordHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' WHERE id = 1;"
```

The password hash is the SHA256 hash of `123456`.

密码哈希是 `123456` 的 SHA256 哈希值。

### Features / 功能说明

- **RSS Feed** / **RSS 订阅**: Subscribe at `/api/feed.xml`
- **Search** / **搜索**: Search posts on the homepage
- **Comments** / **评论**: Anonymous comments with floor numbering (3 per device per day)
- **Likes** / **点赞**: Device-based like system
- **Views** / **浏览量**: Session-based view counting

## Project Structure / 项目结构

```
blog/
├── src/
│   ├── app/
│   │   ├── admin/        # Admin panel
│   │   ├── api/          # API routes
│   │   ├── login/        # Login page
│   │   ├── posts/        # Post pages
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   └── lib/              # Utilities and database
├── data/                 # SQLite database (gitignored)
└── public/               # Static assets
```

## License / 开源协议

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

MIT 许可证

版权所有 (c) 2025

特此免费授予任何获得本软件副本和相关文档文件（"软件"）的人不受限制地处理本软件的权利，包括不受限制地使用、复制、修改、合并、发布、分发、再许可和/或出售本软件副本的权利，并允许向其提供本软件的人员这样做，但须符合以下条件：

上述版权声明和本许可声明应包含在本软件的所有副本或重要部分中。

本软件按"原样"提供，不提供任何形式的明示或暗示的保证，包括但不限于对适销性、特定用途的适用性和非侵权性的保证。在任何情况下，作者或版权持有人均不对任何索赔、损害或其他责任负责，无论是在合同诉讼、侵权行为或其他方面，由本软件或本软件的使用或其他交易引起、由此产生或与之相关。

## Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。
