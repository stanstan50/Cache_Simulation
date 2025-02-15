var blockSize = 0;
		var setSize = 0;
		var MMSize = 0;
		var MMType = "";
		var cacheSize = 0;
		var cacheType = "";
		var programFlow = "";
		var programFlowArr = null;
		var programFlowType = "";
		var isCacheSizeWord = false;
		var	isMMSizeBlock = false;
		var	isProgramFlowBlock = false;
		var cacheSnapshot = null;
		var missCount = 0;
		var hitCount = 0;
		var totalCount = 0;
		var cacheAccessTime = 1;
		var MMAccessTime = 10;
		var missPenalty = 0;
		var averageMemoryAccessTime = 0;
		var totalMemoryAccessTime = 0;
		var originalCache = null;
		var originalMM = null;

		//parses program flow string into array
		//Input: program flow string
		//Output: program flow array of String or Number into global variable programFlowArr
		function parseProgramFlow(programFlow) {
			//blocks (block number) in decimal
			if(programFlowType == "blocks") {
				//remove any non-digit characters before and after the string
				programFlow = programFlow.replace(/\D+/g, ' ');

				//trim
				programFlow = programFlow.trim();

				//splits the string into an array of any non-digit characters
				programFlowArr = programFlow.split(/\D+/);

				//converts the array of strings into an array of numbers
				programFlowArr = programFlowArr.map(Number);
			} else { //words (addresses) in hex, considers A-F hex values
				//remove any non-digit characters before and after the string
				programFlow = programFlow.replace(/[^0-9A-Fa-f]+/g, ' ');

				//trim
				programFlow = programFlow.trim();

				//splits the string into an array of any non-hex value characters
				programFlowArr = programFlow.split(/[^0-9A-Fa-f]+/);

				//converts the array of strings into an array of strings
				programFlowArr = programFlowArr.map(String);

				//converts each string in array to uppercase
				programFlowArr = programFlowArr.map(function(x){return x.toUpperCase();});
			}
			return programFlowArr;
		}

		//gets user input
		function getUserInput() {
			//set all global variables to default values
			blockSize = 0;
			setSize = 0;
			MMSize = 0;
			MMType = "";
			cacheSize = 0;
			cacheType = "";
			programFlow = "";
			programFlowArr = null;
			programFlowType = "";
			hitCount = 0;
			missCount = 0;
			totalCount = 0;
			cacheAccessTime = 1;
			MMAccessTime = 10;
			originalCache = null;
			originalMM = null;


			// using jquery to get the value of the input fields
			blockSize = $("input[name='blocksize']").val();
			setSize = $("input[name='setsize']").val();
			MMSize = $("input[name='mmsize']").val();
			MMType = $("select[name='mmtype']").val();
			cacheSize = $("input[name='cachesize']").val();
			cacheType = $("select[name='cachetype']").val();
			programFlow = $("input[name='progflow']").val();
			programFlowType = $("select[name='progflowtype']").val();
			cacheAccessTime = parseFloat($("input[name='cacheAccessTime']").val());
			MMAccessTime = parseFloat($("input[name='mmAccessTime']").val());
			wordsPerBlock = blockSize;
			blocksPerSet = setSize;
			originalCache = cacheSize;
			originalMM = MMSize;

			console.log("Block Size: " + blockSize + " words" );
			console.log("Set Size: " + setSize + " blocks");
			console.log("MM Memory Size: " + MMSize + " " + MMType);
			console.log("Cache Memory Size: " + cacheSize + " " + cacheType);
			console.log("Program Flow: " + programFlow);
			console.log("program Flow Type: " + programFlowType);

			parseProgramFlow(programFlow);
			console.log("Program Flow Array: " + programFlowArr);
			if (programFlowType == "words") { //convert strings of hex to array of decimal numbers
				programFlow = programFlowArr.map(function(x){return hexadeciToDeci(x);});
				console.log("Program Flow Array (Decimal): " + programFlow);
			} else {
				programFlow = programFlowArr;
			}

			if (cacheType == "words") {
				isCacheSizeWord = true;
			} else {
				isCacheSizeWord = false;
			}

			if (MMType == "blocks") {
				isMMSizeBlock = true;
			} else {
				isMMSizeBlock = false;
			}

			if (programFlowType == "blocks") {
				isProgramFlowBlock = true;
			} else {
				isProgramFlowBlock = false;
			}

			
			
		}

		//helper function that converts hexadecimals to decimals
		function hexadeciToDeci(hex) {
			return parseInt(hex, 16);
		}

		function simulate() {
			console.log("=====================");
			console.log("Simulating...");
			console.log("=====================");
			getUserInput();
			simulateCache();
			displayCache();
			displayResults();
		}

		function simulateCache(){
			if(isCacheSizeWord == true){
				cacheSize = cacheSize/wordsPerBlock;
			}

			if(isMMSizeBlock == true){
				MMSize = wordsPerBlock * MMSize;
			}

			let cache = initializeCacheMemory(cacheSize, blocksPerSet);
			
			let MMbits = getMMBitsWords(MMSize);
			let numOfSets = cacheSize/blocksPerSet;
			let setBits = getSetBits(numOfSets);
			
			for(let ctr = 0; ctr < programFlow.length; ctr++){
				let current = programFlow[ctr];
				

				let tagBits = getTagBits(current, wordsPerBlock, setBits, MMbits, isProgramFlowBlock); 

				if(isProgramFlowBlock == true){
					setNum = getSetNumBlock(current, numOfSets);
				} else {
					setNum = getSetNumWord(current, numOfSets, setBits, MMbits);
				}

				let result = searchSet(tagBits, setNum, cache);


				
				if(result == 1){//if cache hit
					cache = updateFoundBlock(tagBits, setNum, cache);
					hitCount++;	//increment hit count
				} else {//if cache miss
					
					cache = insertMissingBlock(tagBits, setNum, cache, setBits);
					missCount++; //increment miss count
				}

			}

			console.log(cache);
			cacheSnapshot = cache;
			
		}

		

		function displayResults() {	// calculations in nanoseconds
			totalCount = hitCount + missCount;
			missPenalty = cacheAccessTime + blockSize * MMAccessTime + cacheAccessTime;	// 1 cache check + blockSize * memory access + 1 cache read
			averageMemoryAccessTime = (hitCount/totalCount) * cacheAccessTime + (missCount/totalCount) * missPenalty;	// hits/total * cacheAccessTime + misses/total * missPenalty
			//totalMemoryAccessTime = (hitCount * blockSize * cacheAccessTime) + (missCount * blockSize * (MMAccessTime + cacheAccessTime)) + (missCount * cacheAccessTime); 
			totalMemoryAccessTime = (hitCount * blockSize * cacheAccessTime) + (missCount * blockSize * (MMAccessTime + cacheAccessTime)) + (missCount * cacheAccessTime); 


			
			//fix to 2 decimal places
			averageMemoryAccessTime = averageMemoryAccessTime.toFixed(2);
			totalMemoryAccessTime = totalMemoryAccessTime.toFixed(2);
			missPenalty = missPenalty;

			document.querySelector('.simulresults-field').innerHTML = `
				<p>
				Number of Cache Hits: ${hitCount} <br>
				Number of Cache Miss: ${missCount} <br>
				Miss Penalty: ${missPenalty} <br>
				Average Memory Access Time: ${averageMemoryAccessTime} <br>
				Total Memory Access Time: ${totalMemoryAccessTime} <br>
				</p>
			`;

			document.getElementById('exportres').style.display = 'block';
		}

		function exportResults() {
			//store to .txt file (includes both input and output)
			let text = `Results:\nNumber of Cache Hits: ${hitCount} \nNumber of Cache Miss: ${missCount} \nMiss Penalty: ${missPenalty} \nAverage Memory Access Time: ${averageMemoryAccessTime} \nTotal Memory Access Time: ${totalMemoryAccessTime} \n\nInput:\nCache Access Time: ${cacheAccessTime}\nMain Memory Access Time: ${MMAccessTime}\nBlock Size: ${blockSize} words \nSet Size: ${setSize} blocks \nMM Memory Size: ${originalMM} ${MMType} \nCache Memory Size: ${originalCache} ${cacheType} \nProgram Flow: ${programFlowArr} \nProgram Flow Type: ${programFlowType}`;
			let filename = "cacheSim_BSA_LRU-results.txt";
			let blob = new Blob([text], {type: "text/plain;charset=utf-8"});
			saveAs(blob, filename);
		}

		function saveAs(blob, filename) {
			var url = URL.createObjectURL(blob);
			var a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
		}

		function displayCache() {
			document.querySelector('.right-side').innerHTML = createTable();
		}

		function createBlockRow(setNumber, blockNumber) {
			// let strInfo = "-";
			let blockData = cacheSnapshot[setNumber][blockNumber];
			let tagBits = blockData[0];
			let randomString = "";
			if (tagBits != null) {
				tagBits = "[" + tagBits.toString() + "]";
				// strInfo = `[${tagBits}]`;
				randomString = generateRandomString(12);
			} else {
				tagBits = "-";
			}

			let actualBlock = blockData[2];
			if (actualBlock != null) {
				// strInfo += `  ${actualBlock}`;
			} else {
				actualBlock = "-";
			}

			let blockRow = null;
			if (blockNumber == 0) {
				blockRow = `
					<td>${tagBits}</td>
					<td>${actualBlock}</td>
					<td>${randomString}</td>
			`;
			} else {
				blockRow = `
				<tr>
					<td>${tagBits}</td>
					<td>${actualBlock}</td>
					<td>${randomString}</td>
				</tr>
			`;
			}
			

			return blockRow;
		}

		//displays the snapshot on the table
		// Function to create a table row
		function createSetRow(setNumber, setBits) {
			let setBin = decimalToBinary(setNumber, setBits);
			let localSetSize = cacheSnapshot[setNumber].length;
			let setRow = `
				<tr>
					<td rowspan="${localSetSize}">${setNumber} (${setBin})</td>
			`;

			let setData = cacheSnapshot[setNumber];

			for (let blockNumber = 0; blockNumber < setData.length; blockNumber++) {
				setRow += createBlockRow(setNumber, blockNumber);
			}

			setRow += '</tr>'

			return setRow;
		}
		
		function decimalToBinary(N, bits) {
			console.log('number of bits: ' + bits);
			let binary = (N >>> 0).toString(2);
			return binary.padStart(bits, '0');
		}

		function generateRandomString(length) {
			var result = '';
			var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for (var i = 0; i < length; i++) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			return result;
		}

		// Function to create the table
		function createTable() {
			let table = `
				<table>
					<tr>
						<th rowspan="2">Set</th>
						<th colspan="2">Block</th>
						<th rowspan="2">Data</th>
					</tr>
					<tr>
						<th class="tagcol">Tag</th>
						<th>Block</th>
					</tr>
			`;

			//display cache start

			let setBits = numBitsDec(cacheSnapshot.length);
			// Add rows to the table
			for (let setNumber = 0; setNumber < cacheSnapshot.length; setNumber++) {
				table += createSetRow(setNumber, setBits);
			}

			//display cache end

			table += '</table>';

			return table;
		}

		function numBitsDec(value) {
			return Math.log2(value);
		}

		//gets cache size in blocks if user inputted words
		//Input: cache size in words, block size
		//Output: cache size in blocks
		function getCacheSize(wordsSize, wordsPerBlock){
			return wordsSize/wordsPerBlock;
		}

		//gets set number of given block in program flow
		//Input: block number, number of sets
		//Output: set number to be placed
		function getSetNumBlock(blockNum, numOfSets){
			return blockNum % numOfSets;
		}

		//gets set number of given address in program flow
		//Input: address, words per block, number of set bits, MM bits
		//Output: set number to be placed

		function getSetNumWord(address, wordsPerBlock, setBits, MMbits){
			let binaryAddress = getBinaryAddress(address, MMbits);
			let blockBits = getBlockBits(wordsPerBlock);

			let lastMMBit = MMbits - 1;
			let firstSetBit = lastMMBit - blockBits;
			let lastSetBit = firstSetBit - setBits + 1;

			let binarySetNum = binaryAddress.splice(lastSetBit, setBits);

			let setNumber = binaryToDecimal(binarySetNum, setBits);

			return setNumber;
		}

		//Initializes 2d array for cache memory
		//Input: cache size in blocks, blocksPerSet
		//Output: 2d array for cache
		function initializeCacheMemory(cacheSize, blocksPerSet){
			let cache = [];
			let numOfSets = cacheSize/blocksPerSet;


			for(let ctr = 0; ctr < numOfSets; ctr++){
				let set = [];

				for(let i = 0; i < blocksPerSet; i++){
					set.push([null, null, null]);
				}

				cache.push(set);
			}


			return cache;
		}
		
		//checks if the block is in the set in cache
		//Input: tag bits string, set number in cache, cache array
		//Output: 1 if found, 0 if not
		function searchSet(tagBits, setNum, cache){
			let setSize = cache[setNum].length;

			for(let ctr = 0; ctr < setSize; ctr++){
				if(cache[setNum][ctr][0] === tagBits){
					return 1;
				}
			}

			return 0;
		}

		//inserts missing block in set
		//input: tag bits string, set number in cache, cache array
		function insertMissingBlock(tagBits, setNum, cache, setBits){
			let min = cache[setNum][0][1];
			let max = 0;
			let setSize = cache[setNum].length;

			for(let ctr = 0; ctr < setSize; ctr++){
				let currentRecency = cache[setNum][ctr][1];
				if(currentRecency < min){
					min = currentRecency;
				}
				if(currentRecency > max){
					max = currentRecency;
				}
			}


			for(let ctr = 0; ctr < setSize; ctr++){
				let currentRecency = cache[setNum][ctr][1];
				if(currentRecency == min || currentRecency == null){
					cache[setNum][ctr][0] = tagBits;
					cache[setNum][ctr][1] = max + 1;
					cache[setNum][ctr][2] = convertTagToBlock(tagBits, setNum, setBits);
				
					return cache;
				}
			}



		}

		function convertTagToBlock(tagBits, setNum, setBits){
			let binarySet = getBinaryAddress(setNum, setBits);
			binarySet = binarySet.join("");
			let block = tagBits + binarySet;

			block = block.split('').map(Number);

			block = binaryToDecimal(block, block.length);
			return block;
		}


		//recency of tag bit is incremented from max recency value in set
		//input: tagBit of found block, set number, cache array
		function updateFoundBlock(tagBits, setNum, cache){
			let setSize = cache[setNum].length;
			let max = 0;

			for(let ctr = 0; ctr < setSize; ctr++){
				let currentRecency = cache[setNum][ctr][1];
				if(currentRecency > max){
					max = currentRecency;
				}
			}

			for(let ctr = 0; ctr < setSize; ctr++){
				if(cache[setNum][ctr][0] === tagBits){
					cache[setNum][ctr][1] = max + 1;
				}
			}

			return cache;
		}

		//gets tag bits of given address or block in program flow
		//Input: address, words per block, number of set bits, MM bits, check if block or word
		//Output: tag bits in a string
		function getTagBits(address, wordsPerBlock, setBits, MMbits, check){
			let binaryAddress = getBinaryAddress(address, MMbits);
			let blockBits = getBlockBits(wordsPerBlock);
			if(check == true){
				binaryAddress.splice(0,blockBits);
			}


			let tagLength = MMbits - setBits - blockBits;


			let tagString = binaryAddress.splice(0, tagLength);
			
			tagString = tagString.join('');

			return tagString;
		}

		//converts binary to decimal
		//Input: binary array, num of bits
		//Output: decimal from binary
		function binaryToDecimal(binary, numOfBits){
			let decimal = 0;
			let lastBit = numOfBits - 1;

			for(let ctr = 0; ctr < numOfBits; ctr++){
				let twoPower = Math.pow(2, ctr)

				twoPower = twoPower * binary[lastBit - ctr];
				decimal = decimal + twoPower;
			}

			return decimal;
		}

		//gets binary representation of address given address and num of MM bits
		//Input: address, MMbits
		//Output: binary representation of address (in array)
		function getBinaryAddress(address, MMbits){
			let binaryAddress = [];
			let lastBit = MMbits - 1;

			for(let ctr = 0; ctr < MMbits; ctr++){
				binaryAddress.push(0);
			}

			for(let ctr = 0; ctr < MMbits; ctr++){
				let twoPower = lastBit - ctr;
				twoPower = Math.pow(2, twoPower);

				if(address >= twoPower){
					address = address - twoPower;
					binaryAddress[ctr] = 1;
				}
			}

			return binaryAddress;
		}

		//gets block bits given words per block
		//Input: words per block
		//Output: block bits
		function getBlockBits(wordsPerBlock){
			let ctr = 0;

			while(true){
				let twoPower = Math.pow(2, ctr);

				if(twoPower >= wordsPerBlock){
					return ctr;
				}

				ctr++;
			}			
		}


		//Input: number of blocks per set
		//Output: number of bits for set bits in memory address
		function getSetBits(numOfBlocks){
			let ctr = 0;

			while(true){
				let twoPower = Math.pow(2, ctr);

				if(twoPower >= numOfBlocks){
					return ctr;
				}

				ctr++;
			}
		}

		//Gets number of bits for MM (given blocks)
		//Input: number of blocks in MM, num of words per block
		//Output: number of bits for MM
		function getMMBitsBlocks(numOfBlocks, wordsPerBlock){
			let numOfWords = numOfBlocks * wordsPerBlock;
			let ctr = 0;

			while(true){
				let twoPower = Math.pow(2, ctr);

				if(twoPower >= numOfWords){
					return ctr;
				}

				ctr++;
			}
		}

		//Gets number of bits for MM (given words)
		//Input: number of words in MM
		//Output: number of bits for MM
		function getMMBitsWords(numOfWords){
			let ctr = 0;

			while(true){
				let twoPower = Math.pow(2, ctr);

				if(twoPower >= numOfWords){
					return ctr;
				}

				ctr++;
			}
		}