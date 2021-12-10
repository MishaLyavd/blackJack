const MAX_VALUE = 21
const MAX_CARDS = 3

const cardSuits = ['a', 'b', 'c', 'd']
const cardTypes = {
	'2': { label: '2', value: 2 },
	'3': { label: '3', value: 3 },
	'4': { label: '4', value: 4 },
	'5': { label: '5', value: 5 },
	'6': { label: '6', value: 6 },
	'7': { label: '7', value: 7 },
	'8': { label: '8', value: 8 },
	'9': { label: '9', value: 9 },
	'10': { label: '10', value: 10 },
	'J': { label: 'J', value: 10 },
	'Q': { label: 'Q', value: 10 },
	'K': { label: 'K', value: 10 },
}

const gameResult = {
	win: 'Player win',
	lose: 'Player lose',
	draw: 'Draw',
}

function prompt(question) {
	const { stdin, stdout } = process

	stdin.resume()
	stdout.write(`${question}\n`)

	return new Promise((resolve) => {
		stdin.once('data', (data) => {
			stdin.pause()
			resolve(data.toString().trim())
		})
	})
}

function getDeck() {
	const result = []
	for (let id in cardTypes) {
		cardSuits.forEach((suit) => {
			const { label } = cardTypes[id]
			result.push({ id, label, suit })
		})
	}
	return result
}

function addCardFromDeck(cards, deck) {
	const card = deck.shift()
	if (card) cards.push(card)
}

function shuffle(deck) {
	deck.sort(() => 0.5 - Math.random())
}

function countCardsScore(cards) {
	return cards.reduce((score, { id }) => {
		const { value } = cardTypes[id]
		return score + value
	}, 0)
}


function getEndgame(userCards, rivalCards) {
	const userValue = countCardsScore(userCards)
	const rivalValue = countCardsScore(rivalCards)
	if (userValue === rivalValue) return gameResult.draw
	if (userValue > MAX_VALUE && rivalValue > MAX_VALUE) {
		return userValue > rivalValue ? gameResult.lose : gameResult.win
	}
	if (userValue > MAX_VALUE) return gameResult.lose
	if (rivalValue > MAX_VALUE) return gameResult.win
	return userValue > rivalValue ? gameResult.win : gameResult.lose
}

async function confirmReplay() {
	const action = await prompt('Do you want to replay?\n1 Yes\n2 No')
	switch(action) {
		case '1': return true
		case '2':
		default: return false
	}
}

async function playerTurn(cards, deck) {
	if (cards.length === MAX_CARDS) return
	const action = await prompt('Drow another card?\n1 Yes\n2 No')
	switch(action) {
		case '1': return addCardFromDeck(cards, deck)
		case '2':
		default: return
	}
}

function rivalTurn(cards, deck) {
	if (cards.length === MAX_CARDS) return
	const value = countCardsScore(cards)
	const reserve = MAX_VALUE - value
	const random = Math.floor(Math.random() * (10 - 2) + 2)
	if (reserve <= random) return
	addCardFromDeck(cards, deck)
}

function getCardLayers(card) {
	const { label, suit } = card
	const displayedValue = label.length < 2 ? `${label}${suit} ` : `${label}${suit}`
	return [
		' _____ ',
		'|     |',
		`| ${displayedValue} |`,
		'|_____|',
	]
}

function drawCards(cards) {
	console.clear()
	const layers = []
	cards.forEach((card) => {
		const cardLayers = getCardLayers(card)
		cardLayers.forEach((layer, index) => {
			if (layers[index]) layers[index].push(layer)
			else layers[index] = [layer]
		})
	})
	console.log(`${layers.map((layer) => layer.join('\t')).join('\n')}\n`)
}

function displayScore(cards, message) {
	const score = countCardsScore(cards)
	console.log(`${message}: ${score}`)
}

function displayPlayerScore(cards) {
	return displayScore(cards, 'Your score')
}

function displayRivalScore(cards) {
	return displayScore(cards, 'Rival score')
}

function displayTurn(userCards) {
	drawCards(userCards)
	displayPlayerScore(userCards)
}

async function start() {
	const deck = getDeck()
	shuffle(deck)

	const userCards = []
	const rivalCards = []
	addCardFromDeck(userCards, deck)
	addCardFromDeck(rivalCards, deck)
	addCardFromDeck(userCards, deck)
	addCardFromDeck(rivalCards, deck)

	displayTurn(userCards)

	let endgame = false
	while (!endgame) {
		const userCardsLength = userCards.length
		const rivalCardsLength = rivalCards.length
		await playerTurn(userCards, deck)
		rivalTurn(rivalCards, deck)

		displayTurn(userCards)

		endgame = (userCards.length === userCardsLength && rivalCards.length === rivalCardsLength)
			|| (userCards.length === MAX_CARDS && rivalCards.length === MAX_CARDS)
	}

	displayRivalScore(rivalCards)
	console.log(getEndgame(userCards, rivalCards))

	const replay = await confirmReplay()
	if (replay) start()
}

start()
