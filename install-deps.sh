backend_dir="./backend"
frontend_dir="./frontend"

echo "Installing dependencies for backend..."
cd "$backend_dir" || exit
npm install

echo "Installing dependencies for frontend..."
cd ".."
cd "$frontend_dir" || exit
npm install

echo "Dependencies installation complete."
