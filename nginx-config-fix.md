# Nginx 配置修复指南

## 问题分析

根据错误信息 `Failed to load chunk /_next/static/chunks/498bc310fc340189.js` 和你的 Nginx 配置，问题可能出在以下几个方面：

### 1. **Nginx 配置问题**

当前配置中：
```nginx
location /admin {
    return 403;
}
```

这个规则会阻止所有 `/admin` 开头的路径访问，包括：
- `/admin` 页面本身
- 可能影响某些静态资源的加载

### 2. **静态资源代理问题**

Next.js 的静态资源（chunks）需要通过 `/_next/static/` 路径访问，需要确保：
- 正确的 Content-Type 头
- 适当的缓存策略
- 正确的代理配置

### 3. **可能的缓存问题**

浏览器或 Nginx 可能缓存了旧的 chunk 文件，导致加载失败。

## 修复方案

### 方案 1：优化 Nginx 配置（推荐）

将你的 Nginx 配置修改为：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name 116791.xyz;
    index index.php index.html index.htm default.php default.htm default.html;
    root /www/wwwroot/116791.xyz;

    # SSL 配置（保持不变）
    ssl_certificate    /www/server/panel/vhost/cert/116791.xyz/fullchain.pem;
    ssl_certificate_key    /www/server/panel/vhost/cert/116791.xyz/privkey.pem;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000";
    error_page 497  https://$host$request_uri;

    # Next.js 静态资源 - 优先处理
    location /_next/static/ {
        proxy_pass http://localhost:3388;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 静态资源缓存
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Next.js 其他静态资源
    location /_next/ {
        proxy_pass http://localhost:3388;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API 路由
    location /api/ {
        proxy_pass http://localhost:3388;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API 不缓存
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # 如果确实需要阻止 /admin 访问，使用更精确的匹配
    # 注意：这会阻止访问管理页面，如果不需要可以删除
    location = /admin {
        return 403;
    }

    # 主代理配置
    location / {
        proxy_pass http://localhost:3388;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 禁止访问的文件或目录
    location ~ ^/(\.user.ini|\.htaccess|\.git|\.env|\.svn|\.project|LICENSE|README.md) {
        return 404;
    }

    # SSL 证书验证目录
    location ~ \.well-known {
        allow all;
    }

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
        expires 30d;
        access_log /dev/null;
        error_log /dev/null;
    }

    access_log /www/wwwlogs/116791.xyz.log;
    error_log /www/wwwlogs/116791.xyz.error.log;
}
```

### 方案 2：如果不需要阻止 /admin 访问

如果你需要访问 `/admin` 页面，删除或注释掉这个规则：

```nginx
# location /admin {
#     return 403;
# }
```

### 方案 3：检查构建产物

确保服务器上的构建产物是最新的：

```bash
# 在服务器上
cd /path/to/your/blog
npm run build
npm start
```

### 方案 4：清除缓存

1. **清除浏览器缓存**：硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）
2. **清除 Nginx 缓存**（如果启用了缓存）
3. **清除 Next.js 缓存**：删除 `.next` 目录后重新构建

## 调试步骤

1. **检查静态资源是否可访问**：
   - 访问：`https://116791.xyz/_next/static/chunks/498bc310fc340189.js`
   - 如果返回 404 或 403，说明 Nginx 配置有问题

2. **检查 Next.js 服务是否正常运行**：
   ```bash
   curl http://localhost:3388/_next/static/chunks/498bc310fc340189.js
   ```

3. **查看 Nginx 错误日志**：
   ```bash
   tail -f /www/wwwlogs/116791.xyz.error.log
   ```

4. **查看 Next.js 日志**：
   检查 Next.js 应用的运行日志，看是否有错误信息

## 最可能的原因

根据你的配置，**最可能的问题是**：

1. **`location /admin { return 403; }` 规则过于宽泛**，可能影响了某些资源加载
2. **缺少对 `/_next/static/` 的特殊处理**，导致静态资源加载失败
3. **代理头信息不完整**，Next.js 无法正确识别请求

建议先尝试**方案 1**，为 `/_next/static/` 添加专门的配置，并优化代理头信息。








