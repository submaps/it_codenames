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

var game = null;

function start_game() {
    document.getElementById('game_prev_img').hidden = true;
    document.getElementById('game_start_div').hidden = false;

    let datasets = get_datasets();

    if (datasets.length <= 0){
        alert('Select at least one dataset');
    }

    let game_id = document.getElementById('game_id').innerText;
    let captain_id = document.getElementById('captain_id').innerText;

    let team1 = document.getElementById('team1_name').value;
    let team2 = document.getElementById('team2_name').value;

    // let mode_select = document.getElementById("select_hard_mode");
    // let complexity = mode_select.options[mode_select.selectedIndex].value;
    // let complexity = document.getElementById('option1').checked?"easy":"hard";
    // let complexity = document.querySelector('input[name="options"]:checked').value;
    let complexity = vue_edit_teams.complexity;

    let teams = [team1, team2];

    game = JSON.parse(getFromServer("/it_codenames/api/start", {
            game_id: game_id,
            datasets: datasets,
            teams: teams,
            complexity: complexity,
            captain_id: captain_id
        }
    ));
    return game;
}

function get_datasets() {
    return vue_edit_teams.checked_datasets
}

var cur_url_init = (new URL(location.href)).href;

let vue_edit_teams = new Vue({
    el: '#main_menu',
    data: {
        team_name1: 'Alice Bob Charlie',
        team_name2: 'Chuck Dave Eva',
        cur_url: cur_url_init,
        checked_datasets: ['words_maths', 'words_maths', 'words_it'],
        complexity: "easy"
    },
    computed: {
        last_dataset: function(){
                if (this.checked_datasets.length > 0)
                    return this.checked_datasets[this.checked_datasets.length-1];
                return "empty";
        },
        easy_active: function(){
            return this.complexity === "easy"?"btn_active":"btn_noactive";
        },
        hard_active: function(){
            return this.complexity === "hard"?"btn_active":"btn_noactive";
        }
    },
    delimiters: ['[[', ']]']
});


function copyToClipboard(cur_id){
      let text = document.getElementById(cur_id);
      text.select();
      document.execCommand("copy");
}

function copyCaptainUrl(){
    copyToClipboard('captain_url');
}

function copyPlayerUrl(){
    copyToClipboard('player_url');
}