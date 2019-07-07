var op = 0;
var parenthesis = 0;
var mutation_chance = 0.25; // MIN: >0, MAX: 1.
var available_genes = [3, 4, 5, 6, 7]; // So that AI doesn't have access to all genes

var ai = [];

////////////////////////////////    'ai' structure    ////////////////////////////////
////////                                                                      ////////
////////    [0], [1], [2] = R, G, B                                           ////////
////////    [3], [4] = X, Y (pos)                                             ////////
////////    [5], [6] = Width, height                                          ////////
////////    [7] = Rotation                                                    ////////
////////    [8] = Conditions; [8][0] = rotation, [8][1] = movement            ////////
////////    [9] = Length of conditions; [9][0] = rotation, [9][1] = movement  ////////
////////    [10] = Variates; Parent genes OR [width, height] OR other things  ////////
////////    [11] = Variates; Parent genes OR undefined                        ////////
////////                                                                      ////////
//////////////////////////////////////////////////////////////////////////////////////

var time_alive = [];

////////////////////////////////    'time_alive' structure    ////////////////////////////////
////////                                                                              ////////
////////    [0] = Time alive (in game ticks, tick speed varies depending on device)   ////////
////////    [1] = Genes                                                               ////////
////////    [2] = Id                                                                  ////////
////////                                                                              ////////
//////////////////////////////////////////////////////////////////////////////////////////////

var inputs = [
	["+", "-", "*", "/", "<", "<=", ">=", ">", "&&", "||"],
	["(", ")"],
	["ai[__EXENOW(id)__][__EXENOW(available_genes[Math.floor(Math.random() * available_genes.length)])__]", "getRandAIInRange(__EXENOW(id)__)[__EXENOW(available_genes[Math.floor(Math.random() * available_genes.length)])__]", "randomBetween(__EXENOW(Math.floor(Math.random() * 100) - 1)__, __EXENOW(Math.floor(Math.random() * 100) + 1)__)", "__EXENOW(Math.floor(Math.random() * 100))__"]
];
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
	while(raw_code.includes("__EXENOW(")) {
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

function findInput(id, allow_paren) {
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
		
		if(allow_paren && randParenthesis == inputs[1].indexOf("(") && Math.round(Math.random())) {
			parenthesis++;
			op--;
			return inputs[1][randParenthesis];
		} else {
			var raw_code = "";
			raw_code = inputs[2][randVar];
			
			if(!raw_code.includes("__EXENOW(")) {
				return raw_code;
			} else {
				return [execNow(raw_code, id), raw_code];
			}
		}
	}
}

function genRandConditions(id) {
	ai[id].push([]); // Add base for condition genes
	ai[id].push([]); // Add base for condition length genes
	
	for(var action = 0; action < 2; action++) {
		ai[id][9].push(randomBetween(4, 8));
		while(ai[id][9][action] % 2 == 0) {
			ai[id][9][action] = randomBetween(4, 8);
		}
		
		if(Math.round(Math.random())) {
			ai[id][9][action] += 2;
		} else {
			ai[id][9][action] -= 2;
		}
		
		ai[id][8].push([]);
		
		for(i = 0; i + parenthesis < ai[id][9][action]; i++) {
			ai[id][8][action].push(findInput(id, i + parenthesis + 2 < ai[id][9][action]));
			op++;
		}
		
		while(parenthesis > 0) {
			ai[id][8][action].push(")");
			parenthesis--;
		}
		
		op = 0;
	}
}

function getAcceptedTypes(prev_type, conditions, last_pos, parens) {
	if(prev_type == 0) {
		return last_pos ? [3] : [1, 3];
	} else if(prev_type == 1) {
		return [3];
	} else if(prev_type == 2) {
		return [0];
	} else {
		return parens > 0 ? [0, 2] : [0];
	}
}

function getType(item) {
	if(typeof item === 'object') {
		return 3;
	} else if(item == "(") {
		return 1;
	} else if(item == ")") {
		return 2;
	} else {
		return 0;
	}
}

function combineConditions(id, conditions1, conditions2) {
	ai[id].splice(8, 0, []);
	ai[id].splice(9, 0, []);
	
	for(var p = 0; p < 2; p++) {
		ai[id][8].push([]);
		
		var cond1 = conditions1[p];
		var cond2 = conditions2[p];
		
		do {
			ai[id][9].push(randomBetween(Math.min(cond1.length, cond2.length), Math.max(cond1.length, cond2.length)));
			if(ai[id][9][p] % 2 == 0) {
				ai[id][9].splice(p, 1);
			}
		} while(typeof ai[id][9][p] === 'undefined');
		
		if(Math.round(Math.random())) {
			ai[id][9][p] += 2;
		} else if(ai[id][9][p] > 4) {
			ai[id][9][p] -= 2;
		}
		
		parenthesis = 0;
		
		var accepted_types = [1, 3];
		var type;
		for(var i = 0; i + parenthesis < ai[id][9][p]; i++, type == 1 ? parenthesis++ : (type == 2 ? parenthesis-- : 0), accepted_types = getAcceptedTypes(type, [cond1, cond2], i + parenthesis + 1 >= ai[id][9][p], parenthesis)) {
			if(i < cond1.length && (i >= cond2.length || Math.round(Math.random()))) {
				type = getType(cond1[i]);
				if(accepted_types.includes(type)) {
					if(typeof cond1[i] === 'object') {
						var raw_code = ""; // is there any point in doing this?
						raw_code = cond1[i][1];

						ai[id][8][p].push([execNow(raw_code, id), raw_code]);
					} else {
						ai[id][8][p].push(cond1[i]);
					}
					
					continue;
				}
			}
			
			if(i < cond2.length) {
				type = getType(cond2[i]);
				if(accepted_types.includes(type)) {
					if(typeof cond2[i] === 'object') {
						var raw_code = ""; // is there any point in doing this?
						raw_code = cond2[i][1];

						ai[id][8][p].push([execNow(raw_code, id), raw_code]);
					} else {
						ai[id][8][p].push(cond2[i]);
					}
					
					continue;
				}
			}
			
			if(Math.round(Math.random())) {
				var code;
				var matching = false;
				while(!matching) {
					code = Math.round(Math.random()) ? cond1[Math.floor(Math.random() * cond1.length)] : cond2[Math.floor(Math.random() * cond2.length)];
					type = getType(code);
					matching = accepted_types.includes(type);
				}
						
				if(typeof code === 'object') {
					var raw_code = "";
					raw_code = code[1];

					ai[id][8][p].push([execNow(raw_code, id), raw_code]);
				} else {
					ai[id][8][p].push(code);
				}
			} else {
				op = accepted_types.includes(0) ? 1 : 0;
				new_input = findInput(id, i + 2 < ai[id][9][p]);
				ai[id][8][p].push(new_input);
				type = getType(new_input);
			}
		}
		
		while(parenthesis > 0) {
			ai[id][8][p].push(")");
			parenthesis--;
		}
	}
}

function genRandGenes() {
	var width = randomBetween(20, 30);
	var height = width;
	var placeAvailable = ai.indexOf("dead");
	var taken_x_pos = getTakenPos(true, 100);
	var taken_y_pos = getTakenPos(false, 100);
	var x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
	var y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
	
	var spawn_spread = 100;
	while(taken_x_pos.includes(Math.round(x_pos / spawn_spread)) && taken_y_pos.includes(Math.round(y_pos / spawn_spread))) {
		x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
		y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
		
		spawn_spread = spawn_spread * 0.999;
		taken_x_pos = getTakenPos(true, spawn_spread);
		taken_y_pos = getTakenPos(false, spawn_spread);
	}
	
	if(placeAvailable == -1) {
		ai.push([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), x_pos, y_pos, 1.2, 1.2, Math.floor(Math.random() * 360)]);
		genRandConditions(ai.length - 1);
		
		ai[ai.length - 1].push([width, height]);
		
		time_alive.push([0, ai[ai.length - 1].slice(0, 10), ai.length - 1]);
	} else {
		ai[placeAvailable] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), x_pos, y_pos, 1.2, 1.2, Math.floor(Math.random() * 360)];
		genRandConditions(placeAvailable);
		
		ai[placeAvailable].push([width, height]);
		
		time_alive.push([0, ai[placeAvailable].slice(0, 10), placeAvailable]);
	}
}

function combineGenes(par1, par2) {
	var placeAvailable = ai.indexOf("dead");
	
	var width = randomBetween(20, 30);
	var height = width;
	
	var taken_x_pos = getTakenPos(true, 100);
	var taken_y_pos = getTakenPos(false, 100);
	var x_pos = Math.floor(Math.random() * (600 - width * 1.5) + width / 2);
	var y_pos = Math.floor(Math.random() * (600 - height * 1.5) + height / 2);
	
	var spawn_spread = 100;
	while(taken_x_pos.includes(Math.round(x_pos / spawn_spread)) && taken_y_pos.includes(Math.round(y_pos / spawn_spread))) {
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
				combineConditions(ai.length - 1, par1[8], par2[8]);
			} else if(typeof par1[i] === 'number' && i != 9) {
				ai[ai.length - 1].push(randomBetween(Math.min(par1[i], par2[i]), Math.max(par1[i], par2[i])));
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
					for(p = 0; p < 2; p++) {
						for(item = 0; item < ai[ai.length - 1][8][p].length; item++) {
							if(Math.round(Math.random())) {
								if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
									if(Math.round(Math.random())) {
										var code = par1[8][p][Math.floor(Math.random() * par1[8][p].length)];
										if(typeof code === 'object') {
											var raw_code = "";
											raw_code = code[1];
											
											ai[ai.length - 1][8][p][item] = [execNow(raw_code, ai.length - 1), raw_code];
										} else {
											ai[ai.length - 1][8][p][item] = code;
										}
									} else {
										var code = par2[8][p][Math.floor(Math.random() * par2[8][p].length)];
										if(typeof code === 'object') {
											var raw_code = "";
											raw_code = code[1];
											
											ai[ai.length - 1][8][p][item] = [execNow(raw_code, ai.length - 1), raw_code];
										} else {
											ai[ai.length - 1][8][p][item] = code;
										}
									}
								}
							} else if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
								ai[ai.length - 1][8][p][item] = findInput(ai.length - 1, item + 2 < ai[ai.length - 1][8][p].length);
							}
							
							op++;
						}
						
						op = 0;
					}
				}
			}
		}
		
		time_alive.push([0, ai[ai.length - 1].slice(0, 10), ai.length - 1]);
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
				combineConditions(placeAvailable, par1[8], par2[8]);
			} else if(typeof par1[i] === 'number' && i != 9) {
				ai[placeAvailable].push(randomBetween(Math.min(par1[i], par2[i]), Math.max(par1[i], par2[i])));
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
					for(p = 0; p < 2; p++) {
						for(item = 0; item < ai[placeAvailable][8][p].length; item++) {
							if(Math.round(Math.random())) {
								if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
									if(Math.round(Math.random())) {
										var code = par1[8][p][Math.floor(Math.random() * par1[8][p].length)];
										if(typeof code === 'object') {
											var raw_code = "";
											raw_code = code[1];
											
											ai[placeAvailable][8][p][item] = [execNow(raw_code, placeAvailable), raw_code];
										} else {
											ai[placeAvailable][8][p][item] = code;
										}
									} else {
										var code = par2[8][p][Math.floor(Math.random() * par2[8][p].length)];
										if(typeof code === 'object') {
											var raw_code = "";
											raw_code = code[1];
											
											ai[placeAvailable][8][p][item] = [execNow(raw_code, placeAvailable), raw_code];
										} else {
											ai[placeAvailable][8][p][item] = code;
										}
									}
								}
							} else if(Math.floor(Math.random() * (1 / mutation_chance)) == 0) {
								ai[placeAvailable][8][p][item] = findInput(ai.length - 1, item + 2 < ai[placeAvailable][8][p].length);
							}
							
							op++;
						}
						
						op = 0;
					}
				}
			}
		}
		
		time_alive.push([0, ai[placeAvailable].slice(0, 10), placeAvailable]);
	}
}
