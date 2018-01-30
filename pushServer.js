const webPush = require('web-push');
const pushServerKeys = require('./pushServerKeys');
const pushClientSubscription = require('./pushClientSubscription');

webPush.setVapidDetails("mailto:christophemilliere93@gmail.com", pushServerKeys.publicKey, pushServerKeys.privateKey);

const subscription = {
	endpoint: pushClientSubscription.endpoint,
	keys: {
		auth: pushClientSubscription.keys.auth,
		p256dh: pushClientSubscription.keys.p256dh
	}
};

webPush.sendNotification(subscription, 'Notification envoyé depuis le serveur push node...')
	.then(response => {
		console.log("Push notification à bien été pousser", response);
	}).catch(err => console.error)