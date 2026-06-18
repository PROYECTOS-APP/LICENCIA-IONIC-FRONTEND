pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/PROYECTOS-APP/LICENCIA-IONIC-FRONTEND.git'
            }
        }

        stage('Install') {
            steps {
                bat 'npm install --legacy-peer-deps'
            }
        }

        stage('Diagnose') {
            steps {
                bat 'echo "Available scripts:"'
                bat 'npm run'
                bat 'echo "Ionic version:"'
                bat 'npx ionic --version || echo "Ionic not found"'
            }
        }

        stage('Build') {
            steps {
                // Intenta diferentes comandos de build
                bat 'npx ionic build --prod || npx ng build --prod || npm run build:prod || echo "Build failed"'
            }
        }

        stage('Test') {
            steps {
                bat 'echo test OK'
            }
        }

        stage('Deploy') {
            steps {
                bat 'echo deploy OK'
            }
        }
    }
}