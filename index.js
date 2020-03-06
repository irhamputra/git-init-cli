const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const files = require('./lib/files');
const repo  = require('./lib/repo');
const github = require('./lib/github');

clear();

console.log(
		chalk.yellow(
				figlet.textSync('GitHub Init', { horizontalLayout: 'full' })
		)
);

if (files.directoryExists('.git')) {
		console.log(chalk.red('Already a Git repository!'));
		process.exit();
}

const getGithubToken = async () => {
		// Fetch token from config store
		let token = github.getStoredGithubToken();
		if(token) {
				return token;
		}
		
		// No token found, use credentials to access GitHub account
		token = await github.getPersonalAccessToken();
		
		return token;
};

const run = async () => {
		try {
				// Retrieve & Set Authentication Token
				const token = await getGithubToken();
				github.githubAuth(token);
				
				// Create remote repository
				const url = await repo.createRemoteRepo();
				
				// Create .gitignore file
				await repo.createGitIgnore();
				
				// Set up local repository and push to remote
				await repo.setupRepo(url);
				
				console.log(chalk.green('All done!'));
		} catch(err) {
				if (err) {
						switch (err.status) {
								case 401:
										console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
										break;
								case 422:
										console.log(chalk.red('There is already a remote repository or token with the same name'));
										break;
								default:
										console.log(chalk.red(err));
						}
				}
		}
};

run();