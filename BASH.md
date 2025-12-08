zip -r blog.zip . -x ".idea/*" ".next/*" "node_modules/*" "data/*" ".git/"
npm run build
pm2 start npm --name "my-blog" -- start
