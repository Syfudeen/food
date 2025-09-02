# Download SQLite JDBC Driver
$url = "https://github.com/xerial/sqlite-jdbc/releases/download/3.43.0.0/sqlite-jdbc-3.43.0.0.jar"
$output = "sqlite-jdbc-3.43.0.0.jar"

Write-Host "Downloading SQLite JDBC Driver..."
Invoke-WebRequest -Uri $url -OutFile $output

# Compile and run
Write-Host "Compiling Java files..."
javac -cp "sqlite-jdbc-3.43.0.0.jar;." TestServer.java DatabaseHelper.java

Write-Host "Starting server..."
java -cp "sqlite-jdbc-3.43.0.0.jar;." TestServer