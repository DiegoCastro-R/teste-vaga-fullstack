backend_dir="./backend"
frontend_dir="./frontend"

echo "Starting backend..."
cd "$backend_dir" || {
  echo "Error: Backend directory not found: $backend_dir"
  exit 1
}
npx prisma migrate dev
npx prisma generate
npm run start &


sleep 5

echo "Starting frontend..."
cd ".."
cd "$frontend_dir" || {
  echo "Error: Frontend directory not found: $frontend_dir"
  exit 1
}
npm run build
npm run start
