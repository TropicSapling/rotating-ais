var op = 0;
var parenthesis = 0;
var mutation_chance = 0.25; // MIN: >0, MAX: 1.
var max_genes = 8; // So that AI doesn't have access to genes #8+

var ai = [];
var time_alive = [];
var inputs = [["+", "-", "*", "/", "<", "<=", ">=", ">", "&&", "||"], ["(", ")"], ["ai[__EXENOW(id)__][__EXENOW(Math.floor(Math.random() * max_genes))__]", "getRandAIInRange(__EXENOW(id)__)[__EXENOW(Math.floor(Math.random() * max_genes))__]"]];
var changing_inputs = ["ai[", "getRandAIInRange("]; // Used in game.js to speed up evolution, the first parts of inputs[2] before the '__EXENOW(...)__'

function randomBetween(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function spliceStr(str, index, pos) {
	return str.slice(0, index) + str.slice(pos);
}

function getTakenPos(getX, spread) {
	var arr = [];
	for(var i = 0; i < ai.length; i++) {
		if(getX) {
			arr.push(Math.round(ai[i][3] / spread));
		} else {
			arr.push(Math.round(ai[i][4] / spread));
		}
	}
	
	return arr;
}

function execNow(raw_code, id) {
	while(raw_code.indexOf("__EXENOW(") != -1) {
		var index = raw_code.indexOf("__EXENOW(");
		var pos = index + 9; // 9 = "__EXENOW(".length
		
		raw_code = spliceStr(raw_code, index, pos); // Removes "__EXENOW("
		pos -= 9;
		
		var codeToExec = "";
		while(!(raw_code[pos] == "_" && raw_code[pos + 1] == "_")) {
			codeToExec += raw_code[pos];
			pos++;
		}
		codeToExec = codeToExec.slice(0, codeToExec.length - 1); // Removes ")" from code to execute
		pos--;
		
		raw_code = spliceStr(raw_code, pos, pos + 3); // Removes remaining ")__"
		
		try {
			var new_code = new Function("id", "return " + codeToExec);
			var new_code_ret = new_code(id);
			raw_code = raw_code.replace(codeToExec, new_code_ret);
		} catch(e) {
			throw e;
		}
	}
	
	return raw_code; // Which is now actually processed but no idea in creating a new variable just to rename it so...
}

function findInput(id) {
	var randParenthesis = Math.round(Math.random());
	
	if(op % 2) {
		var randOp = Math.floor(Math.random() * (inputs[0].length));
		
		if(parenthesis > 0 && randParenthesis == inputs[1].indexOf(")") && Math.round(Math.random())) {
			parenthesis--;
			op--;
			return inputs[1][randParenthesis];
		} else {
			return inputs[0][randOp];
		}
	} else {
		var randVar = Math.floor(Math.random() * (inputs[2].length));
		
		if(randParenthesis == inputs[1].indexOf("(") && Math.round(Math.random())) {
			parenthesis++;
			op--;
			return inputs[1][randParenthesis];
		} else {
			if(Math.round(Math.random())) {
				var randNumber = Math.floor(Math.random() * 100)
				return randNumber;
			} else {
				var raw_code = "";
				raw_code = inputs[2][randVar];
				
				return [execNow(raw_code, id), raw_code];
			}
		}
	}
}

function genRandCond(id) {
	ai[id].push([]); // Add base for condition gene
	ai[id].push(randomBetween(4, 16)); // Add base for the gene controlling the length of the condition gene
	while(ai[id][9] % 2 == 0) {
		ai[id][9] = randomBetween(4, 16);
	}
	
	if(Math.round(Math.random())) {
		ai[id][9] += 2; // [9] = where the length of condition gene is stored
	} else {
		ai[id][9] -= 2;
	}
	
	for(i = 0; i < ai[id][9]; i++) {
		ai[id][8].push(findInput(id));
		op++;
	}
	
	op = 0;
	
	while(parenthesis > 0) {
		ai[id][8].push(")"); // [8] = where the condition gene is stored
		parenthesis--;
	}
}

function combineConditions(id, cond1, cond2, cond_len1, cond_len2) {
	ai[id].splice(8, 0, []);
	do {
		ai[id].splice(9, 0, randomBetween(Math.min(cond_len1, cond_len2) - 1, Math.max(cond_len1, cond_len2) + 1));
		if(ai[id][9] % 2 == 0) {
			ai[id].splice(9, 1);
		}
	} while(ai[id][9] % 2 == 0);
		
	if(Math.round(Math.random())) {
		ai[id][9] += 2;
	} else if(ai[id][9] > 2) {
		ai[id][9] -= 2;
	}
	
	for(var i = 0; i < ai[id][9]; i++) {
		if(i < cond1.length && (i >= cond2.length || Math.round(Math.random()))) {
			if(typeof cond1[i] === 'object') {
				var raw_code = "";
				raw_code = cond1[i][1];
				
				ai[id][8].push([execNow(raw_code, id), raw_code]);
			} else {
				ai[id][8].push(cond1[i]);
			}
		} else if(i < cond2.length) {
			if(typeof cond2[i] === 'object') {
				var raw_code = "";
				raw_code = cond2[i][1];
				
				ai[id][8].push([execNow(raw_code, id), raw_code]);
			} else {
				ai[id][8].push(cond2[i]);
			}
		} else {
			if(Math.round(Math.random())) {
				if(Math.round(Math.random())) {
					var code = cond1[Math.floor(Math.random() * cond1.length)];
					if(typeof code === 'object') {
						var raw_code = "";
						raw_code = code[1];
						
						ai[id][8].push([execNow(raw_code, id), raw_code]);
					} else {
						ai[id][8].push(code);
					}
				} else {
					var code = cond2[Math.floor(Math.random() * cond2.length)];
					if(typeof code === 'object') {
						var raw_code = "";
						raw_code = code[1];
						
						ai[id][8].push([execNow(raw_code, id), raw_code]);
					} else {
						ai[id][8].push(code);
					}
				}
			} else {
				ai[id][8].push(findInput(id));
			}
		}
	}
}

function genRandGenes() {
	var width = randomBetween(19, 31);
	var height = width;
	var placeAvailable = ai.indexOf("dead");
	var taken_x_pos = getTakenPos(true, 100);
	var taken_y_pos = getTakenPos(false, 100);
	var x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
	var y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
	
	var spawn_spread = 100;
	while(taken_x_pos.indexOf(Math.round(x_pos / spawn_spread)) != -1 && taken_y_pos.indexOf(Math.round(y_pos / spawn_spread)) != -1) {
		x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
		y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
		
		spawn_spread = spawn_spread * 0.999;
		taken_x_pos = getTakenPos(true, spawn_spread);
		taken_y_pos = getTakenPos(false, spawn_spread);
	}
	
	if(placeAvailable == -1) {
		ai.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), x_pos, y_pos, 1.2, 1.2, Math.floor(Math.random() * 360)]);
		genRandCond(ai.length - 1);
		
		ai[ai.length - 1].push([width, height]);
		
		time_alive.push([0, ai[ai.length - 1], ai.length - 1]);
	} else {
		ai[placeAvailable] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), x_pos, y_pos, 1.2, 1.2, Math.floor(Math.random() * 360)];
		genRandCond(placeAvailable);
		
		ai[placeAvailable].push([width, height]);
		
		time_alive.push([0, ai[placeAvailable], placeAvailable]);
	}
}

function combineGenes(par1, par2) {
	var placeAvailable = ai.indexOf("dead");
	
	var width = randomBetween(19, 31);
	var height = width;
	
	var taken_x_pos = getTakenPos(true, 100);
	var taken_y_pos = getTakenPos(false, 100);
	var x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
	var y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
	
	var spawn_spread = 100;
	while(taken_x_pos.indexOf(Math.round(x_pos / spawn_spread)) != -1 && taken_y_pos.indexOf(Math.round(y_pos / spawn_spread)) != -1) {
		x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
		y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
		
		spawn_spread = spawn_spread * 0.999;
		taken_x_pos = getTakenPos(true, spawn_spread);
		taken_y_pos = getTakenPos(false, spawn_spread);
	}
	
	if(placeAvailable == -1) {
		ai.push([]);
		
		for(var i = 0; i < par1.length; i++) {
			if(i == 5 || i == 6) {
				ai[ai.length - 1].push(1.2);
			} else if(i == 3) {
				ai[ai.length - 1].push(x_pos);
			} else if(i == 4) {
				ai[ai.length - 1].push(y_pos);
			} else if(i == 8) {
				combineConditions(ai.length - 1, par1[8], par2[8], par1[9], par2[9]);
			} else if(typeof par1[i] === 'number' && i != 9) {
				ai[ai.length - 1].push(randomBetween(Math.min(par1[i], par2[i]) - 1, Math.max(par1[i], par2[i]) + 1));
			}
		}
		
		ai[ai.length - 1].push([width, height]);
		ai[ai.length - 1].push([par1[8], par2[8]]);
		
		for(var i = 0; i < ai[ai.length - 1].length; i++) {
			if(i != 5 && i != 6 && i < 9 && Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
				if(typeof ai[ai.length - 1][i] === 'number') {
					if(Math.round(Math.random())) {
						ai[ai.length - 1][i] += 2;
					} else {
						ai[ai.length - 1][i] -= 2;
					}
				} else if(i == 8) {
					for(item = 0; item < ai[ai.length - 1][8].length; item++) {
						if(Math.round(Math.random())) {
							if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
								if(Math.round(Math.random())) {
									var code = par1[8][Math.floor(Math.random() * par1[8].length)];
									if(typeof code === 'object') {
										var raw_code = "";
										raw_code = code[1];
										
										ai[ai.length - 1][8][item] = [execNow(raw_code, ai.length - 1), raw_code];
									} else {
										ai[ai.length - 1][8][item] = code;
									}
								} else {
									var code = par2[8][Math.floor(Math.random() * par2[8].length)];
									if(typeof code === 'object') {
										var raw_code = "";
										raw_code = code[1];
										
										ai[ai.length - 1][8][item] = [execNow(raw_code, ai.length - 1), raw_code];
									} else {
										ai[ai.length - 1][8][item] = code;
									}
								}
							}
						} else if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
							ai[ai.length - 1][8][item] = findInput(ai.length - 1);
						}
						
						op++;
					}
					
					op = 0;
				}
			}
		}
		
		time_alive.push([0, ai[ai.length - 1], ai.length - 1]);
	} else {
		ai[placeAvailable] = [];
		
		for(var i = 0; i < par1.length; i++) {
			if(i == 5 || i == 6) {
				ai[placeAvailable].push(1.2);
			} else if(i == 3) {
				ai[placeAvailable].push(x_pos);
			} else if(i == 4) {
				ai[placeAvailable].push(y_pos);
			} else if(i == 8) {
				combineConditions(placeAvailable, par1[8], par2[8], par1[9], par2[9]);
			} else if(typeof par1[i] === 'number' && i != 9) {
				ai[placeAvailable].push(randomBetween(Math.min(par1[i], par2[i]) - 1, Math.max(par1[i], par2[i]) + 1));
			}
		}
		
		ai[placeAvailable].push([width, height]);
		ai[placeAvailable].push([par1[8], par2[8]]);
		
		for(var i = 0; i < ai[placeAvailable].length; i++) {
			if(i != 5 && i != 6 && i < 9 && Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
				if(typeof ai[placeAvailable][i] === 'number') {
					if(Math.round(Math.random())) {
						ai[placeAvailable][i] += 2;
					} else {
						ai[placeAvailable][i] -= 2;
					}
				} else if(i == 8) {
					for(item = 0; item < ai[placeAvailable][8].length; item++) {
						if(Math.round(Math.random())) {
							if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
								if(Math.round(Math.random())) {
									var code = par1[8][Math.floor(Math.random() * par1[8].length)];
									if(typeof code === 'object') {
										var raw_code = "";
										raw_code = code[1];
										
										ai[placeAvailable][8][item] = [execNow(raw_code, placeAvailable), raw_code];
									} else {
										ai[placeAvailable][8][item] = code;
									}
								} else {
									var code = par2[8][Math.floor(Math.random() * par2[8].length)];
									if(typeof code === 'object') {
										var raw_code = "";
										raw_code = code[1];
										
										ai[placeAvailable][8][item] = [execNow(raw_code, placeAvailable), raw_code];
									} else {
										ai[placeAvailable][8][item] = code;
									}
								}
							}
						} else if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
							ai[placeAvailable][8][item] = findInput(placeAvailable);
						}
						
						op++;
					}
					
					op = 0;
				}
			}
		}
		
		time_alive.push([0, ai[placeAvailable], placeAvailable]);
	}
}
