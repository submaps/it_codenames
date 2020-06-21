function getFromServer(query, params_dict) {
    // let response = await fetch(query);
    // return await response.text();
    let xhttp = new XMLHttpRequest();
    let params = '';
    for (let k in params_dict) {
        params += k + '=' + encodeURIComponent(params_dict[k]) + '&';
    }
    // let params = 'name=' + encodeURIComponent(name) + '&surname=' + encodeURIComponent(surname);
    xhttp.open("GET", query + '?' + params, false);
    xhttp.send();
    return xhttp.responseText;
}

function players_cell_click(element) {
    if (!element.disabled) {
        let cur_class = element.getAttribute('class').replace('player_', 'color_');
        let i = parseFloat(element.getAttribute('i'));
        let j = parseFloat(element.getAttribute('j'));
        element.setAttribute('class', cur_class);
        // element.style.webkitFilter = "blur(0.3px)";
        // element.style.webkitFilter = "opacity(0.3)";
        element.disabled = true;

        let cur_number = parseFloat(cur_class.replace('color_', ''));
        game_vue.add_cell(cur_number, i, j);
    }
}


function captains_cell_click(element) {
    if (!element.disabled) {
        let i = parseFloat(element.getAttribute('i'));
        let j = parseFloat(element.getAttribute('j'));

        // element.style.webkitFilter = "opacity(0.3)";

        let cur_class = element.getAttribute('class');
        element.setAttribute('class', cur_class.replace('captain_', 'color_'));
        element.disabled = true;

        getFromServer('/it_codenames/api/send_change',
            {
                action_name: 'captain_click',
                game_id:
                game_vue.game.game_id,
                i: i, j: j,
                current_move: game_vue.game.current_move
            });

       let cur_number = parseFloat(
        cur_class.replace('captain_', ''));
        game_vue.add_cell(cur_number, i, j);
    }
}


function updateMathContent() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.getElementById("captains_table")]);
}

try {
    updateMathContent();
} catch {

}


function get_game_by_id(game_id) {
    return JSON.parse(getFromServer("/it_codenames/api/get_game", {
            game_id: game_id
        }
    ));
}

function start_vue() {
    let game_id = parseFloat(document.getElementById('game_id').innerText);
    // let current_move = parseFloat(document.getElementById('current_move').innerText);
    // let team1_score = parseFloat(document.getElementById('team1_score').innerText);
    // let team2_score = parseFloat(document.getElementById('team2_score').innerText);
    // let team1_name = document.getElementById('team1_name').innerText;
    // let team2_name = document.getElementById('team2_name').innerText;

    let state = get_game_by_id(game_id);

    let game_vue = new Vue({
        el: "#inner_div",
        data: {
            // game_id: game_id,
            // team1_name: team1_name,
            // team2_name: team2_name,
            // current_move: current_move,
            team1_score: state.team1_score,
            team2_score: state.team2_score,
            // team1_class: 'color_t1 checked_team left_side',
            // team2_class: 'color_t2 unchecked_team right_side',
            // words_left_team1: 9 - team1_score,
            // words_left_team2: 8 - team2_score,
            // i_list: [],
            // j_list: [],
            game: state
        },
        methods: {
            send_current_move: function (game_id, current_move) {
                getFromServer('/it_codenames/api/send_change', {
                    action_name: 'change_team',
                    game_id: game_id,
                    current_move: current_move
                })
            },
            set_team1_move: function () {
                this.game.current_move = 1;
                this.game.team1_class = 'color_t1 checked_team left_side';
                this.game.team2_class = 'color_t2 unchecked_team right_side';
                this.send_current_move(this.game.game_id, this.game.current_move);
            },
            set_team2_move: function () {
                this.game.current_move = 2;
                this.game.team1_class = 'color_t1 unchecked_team left_side';
                this.game.team2_class = 'color_t2 checked_team right_side';
                this.send_current_move(this.game.game_id, this.game.current_move);
            },
            add_cell: function (cell_number, i, j) {
                if (cell_number === 3) {
                    if (this.game.current_move === 1){
                        this.team1_score = -100;
                    }

                    if (this.game.current_move === 2) {
                        this.team2_score = -100;
                    }
                    return true;
                }
                if (cell_number === 0) {
                    this.game.current_move === 2 ? this.set_team1_move() : this.set_team2_move();
                    return true;
                }
                if (this.game.current_move === cell_number) {
                    if (cell_number === 1) {
                        this.team1_score++;
                        return true;
                    }
                    if (cell_number === 2) {
                        this.team2_score++;
                        return true;
                    }
                } else {
                    if (cell_number === 1) {
                        this.team1_score++;
                        this.set_team1_move();
                    }
                    if (cell_number === 2) {
                        this.team2_score++;
                        this.set_team2_move();
                    }
                }
            },
            send_score: function (game_id, team_num, score_team) {
                getFromServer('/it_codenames/api/send_change',
                    {
                        action_name: 'send_score',
                        game_id: game_id,
                        team_num: team_num,
                        score_team: score_team
                    }
                )
            },
        },
        watch: {
            team1_score: function (team1_score) {
                // this.game.words_left_team1 -= 1;
                this.game.team1_score = team1_score;
                this.send_score(this.game.game_id, 1, this.game.team1_score);
            },
            team2_score: function (team2_score) {
                // this.game.words_left_team2 -= 1;
                this.game.team2_score = team2_score;
                this.send_score(this.game.game_id, 2, this.game.team2_score);
            },
            // current_move: function() {this.send_current_move();},
            // pusher_msg: function() {
            //     window.location.reload();
            // },
            deep: true
        },
        delimiters: ['[[', ']]']
    });
    return game_vue;
}

var game_vue = start_vue();
if (game_vue.game.current_move === 1) {
    game_vue.set_team1_move();
} else {
    game_vue.set_team2_move();
}


// Pusher.logToConsole = true;
// var pusher = new Pusher('d0fd94a7970b32b4e1e3', {
//     cluster: 'eu'
// });


// var pusher_data = null;
// var channel = pusher.subscribe(`${game_vue.game.game_id}`);
// channel.bind('my-event', function (data) {
//     console.log('data');
//     console.log(data);
//     // console.log(data.team1_name);
//     // console.log(data.team2_name);
//     pusher_data = data;
//     // Vue.set(game_vue.game, data);
//     // game_vue.$forceUpdate();
//     for (const [key, value] of Object.entries(data)) {
//       console.log(key, value);
//       Vue.set(game_vue.game, key, value);
//     }
//     // game_vue.game = data;
// });
