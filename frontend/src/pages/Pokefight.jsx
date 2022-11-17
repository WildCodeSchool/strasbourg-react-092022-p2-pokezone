import React, { useState, useEffect } from "react";
import axios from "axios";
import Attack from "../components/Pokefight/Attack";
import FightingPoke from "../components/Pokefight/FightingPoke";
import VictoryScreen from "../components/Pokefight/VictoryScreen";
import DefeatScreen from "../components/Pokefight/DefeatScreen";
import pokeVS from "../assets/pokeVS.png";
import effect from "../assets/tables/effectiveness";
import loadingImg from "../assets/loading.png";
import "./css/pokefight.css";

function Pokefight() {
  const loadingpoke = {
    name: "loading",
    image: loadingImg,
    baseHP: 0,
    hp: 0,
    a: 0,
    as: 0,
    d: 0,
    ds: 0,
    speed: 0,
    types: ["normal"],
    attack1: {
      name: "loading",
      prio: 0,
      acc: 0,
      power: 0,
      type: "",
      el: "normal",
    },
    attack2: {
      name: "loading",
      prio: 0,
      acc: 0,
      power: 0,
      type: "",
      el: "normal",
    },
    attack3: {
      name: "loading",
      prio: 0,
      acc: 0,
      power: 0,
      type: "",
      el: "normal",
    },
    attack4: {
      name: "loading",
      prio: 0,
      acc: 0,
      power: 0,
      type: "",
      el: "normal",
    },
  };
  const [names, setNames] = useState();
  const [myPoke, setMyPoke] = useState(loadingpoke);
  const [enmyPoke, setEnmyPoke] = useState(loadingpoke);
  const [gameState, setGameState] = useState(0);
  function randomTab(tab) {
    if (!tab) {
      return tab;
    }
    const nb = Math.floor(Math.random() * tab.length);
    return tab[nb];
  }
  async function getListOfNames() {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon/?limit=151"
    );
    const pokedata = response.data.results;
    const list = [];
    pokedata.forEach((e) => {
      list.push(e.name);
    });
    return list;
  }
  async function isDmg(nameM) {
    const result = await axios.get(`https://pokeapi.co/api/v2/move/${nameM}`);
    const moveData = result.data;
    if (moveData.power != null && moveData.accuracy != null) {
      return true;
    }
    return false;
  }
  async function getAttackList(list) {
    const result = [];
    for await (const i of list) {
      const test = await isDmg(i.move.name);
      if (test) {
        result.push(i.move.name);
      }
    }

    return result;
  }
  async function getAttack(nameM) {
    const response = await axios.get(`https://pokeapi.co/api/v2/move/${nameM}`);
    const moveData = response.data;
    const move = {
      name: nameM,
      prio: moveData.priority,
      acc: moveData.accuracy,
      power: moveData.power,
      type: moveData.damage_class.name,
      el: moveData.type.name,
    };
    return move;
  }
  async function createPoke(nameP, data, aList) {
    const pokemon = {
      name: nameP,
      image: data.sprites.other["official-artwork"].front_default,
      baseHP: data.stats[0].base_stat * 2 + 110,
      hp: data.stats[0].base_stat * 2 + 110,
      a: data.stats[1].base_stat * +5,
      as: data.stats[3].base_stat * +5,
      d: data.stats[2].base_stat * +5,
      ds: data.stats[4].base_stat * +5,
      speed: data.stats[5].base_stat * +5,
      types: data.types.map((e) => e.type.name),
      attack1: await getAttack(randomTab(aList)),
      attack2: await getAttack(randomTab(aList)),
      attack3: await getAttack(randomTab(aList)),
      attack4: await getAttack(randomTab(aList)),
    };
    return pokemon;
  }
  async function initiatePoke(nameP) {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${nameP}`
    );
    const pokedata = response.data;
    const moveList = await getAttackList(pokedata.moves);
    const pokemon = await createPoke(nameP, pokedata, moveList);
    return pokemon;
  }
  async function randomSet() {
    setGameState(0);
    setMyPoke(loadingpoke);
    setEnmyPoke(loadingpoke);
    setMyPoke(await initiatePoke(randomTab(names)));
    setEnmyPoke(await initiatePoke(randomTab(names)));
  }
  function stab(el, list) {
    if (list.includes(el)) {
      return 1.5;
    }
    return 1;
  }
  function calcDMG(pokA, pokD, atk) {
    const random = (Math.random() * (255 - 217 + 1) + 217) / 255;
    let dmgDone = 0;
    if (atk.type === "physical") {
      dmgDone =
        ((42 * atk.power * (pokA.a / pokD.d)) / 50 + 2) *
        stab(atk.el, pokA.types) *
        effect[pokD.types[0]][atk.el];
      if (pokD.types.length === 2) {
        dmgDone *= effect[pokD.types[1]][atk.el];
      }
      if (dmgDone > 2) {
        dmgDone *= random;
      }
    } else if (atk.type === "special") {
      dmgDone =
        ((42 * atk.power * (pokA.as / pokD.ds)) / 50 + 2) *
        stab(atk.el, pokA.types) *
        effect[pokD.types[0]][atk.el];
      if (pokD.types.length === 2) {
        dmgDone *= effect[pokD.types[1]][atk.el];
      }
      if (dmgDone > 2) {
        dmgDone *= random;
      }
    }
    return Math.round(dmgDone);
  }
  function dealDMG(atk) {
    if (myPoke.hp === 0 || enmyPoke.hp === 0) {
      return;
    }
    const enmyAtk = enmyPoke[`attack${Math.floor(Math.random() * 4) + 1}`];
    let isFirst = myPoke;
    let isSecond = enmyPoke;
    if (atk.prio < enmyAtk.prio) {
      isFirst = enmyPoke;
      isSecond = myPoke;
    } else if (myPoke.speed < enmyPoke.speed) {
      isFirst = enmyPoke;
      isSecond = myPoke;
    }
    if (isFirst === myPoke) {
      if (atk.acc >= Math.floor(Math.random() * 101)) {
        if (enmyPoke.hp - calcDMG(myPoke, enmyPoke, atk) < 0) {
          setEnmyPoke({ ...enmyPoke, hp: 0 });
          setGameState(1);
          return;
        }
        setEnmyPoke({
          ...enmyPoke,
          hp: enmyPoke.hp - calcDMG(myPoke, enmyPoke, atk),
        });
      }
      if (enmyAtk.acc >= Math.floor(Math.random() * 101)) {
        if (myPoke.hp - calcDMG(enmyPoke, myPoke, enmyAtk) < 0) {
          setMyPoke({ ...myPoke, hp: 0 });
          setGameState(2);
          return;
        }
        setMyPoke({
          ...myPoke,
          hp: myPoke.hp - calcDMG(enmyPoke, myPoke, enmyAtk),
        });
      }
    } else if (isSecond === myPoke) {
      if (enmyAtk.acc >= Math.floor(Math.random() * 101)) {
        if (myPoke.hp - calcDMG(enmyPoke, myPoke, enmyAtk) < 0) {
          setMyPoke({ ...myPoke, hp: 0 });
          setGameState(2);
          return;
        }
        setMyPoke({
          ...myPoke,
          hp: myPoke.hp - calcDMG(enmyPoke, myPoke, enmyAtk),
        });
      }
      if (atk.acc >= Math.floor(Math.random() * 101)) {
        if (enmyPoke.hp - calcDMG(myPoke, enmyPoke, atk) < 0) {
          setEnmyPoke({ ...enmyPoke, hp: 0 });
          setGameState(1);
          return;
        }
        setEnmyPoke({
          ...enmyPoke,
          hp: enmyPoke.hp - calcDMG(myPoke, enmyPoke, atk),
        });
      }
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      const genList = await getListOfNames();
      setNames(genList);
      setMyPoke(await initiatePoke(randomTab(genList)));
      setEnmyPoke(await initiatePoke(randomTab(genList)));
    };

    fetchData().catch(console.error);
  }, []);
  function gameStateDisplay(e) {
    switch (e) {
      case 0:
        return (
          <div className="ongoing">
            <div className="terrain">
              <FightingPoke
                player={1}
                baseHP={enmyPoke.baseHP}
                hp={enmyPoke.hp}
                name={enmyPoke.name}
                image={enmyPoke.image}
                types={enmyPoke.types}
              />
              <FightingPoke
                player={0}
                baseHP={myPoke.baseHP}
                hp={myPoke.hp}
                name={myPoke.name}
                image={myPoke.image}
                types={myPoke.types}
              />
            </div>
            <div className="abilities">
              <Attack
                pos={1}
                info={myPoke.attack1}
                onClick={() => {
                  dealDMG(myPoke.attack1);
                }}
              />
              <Attack
                pos={2}
                info={myPoke.attack2}
                onClick={() => {
                  dealDMG(myPoke.attack2);
                }}
              />
              <Attack
                pos={3}
                info={myPoke.attack3}
                onClick={() => dealDMG(myPoke.attack3)}
              />
              <Attack
                pos={4}
                info={myPoke.attack4}
                onClick={() => {
                  dealDMG(myPoke.attack4);
                }}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <VictoryScreen
            img={myPoke.image}
            name={myPoke.name}
            onClick={() => {
              randomSet();
            }}
          />
        );

      case 2:
        return (
          <DefeatScreen
            img={enmyPoke.image}
            name={enmyPoke.name}
            onClick={() => {
              randomSet();
            }}
          />
        );

      default:
        return "something is wrong";
    }
  }
  if (!myPoke || !enmyPoke) {
    return <>loading...</>;
  }
  return (
    <div className="Pokefight">
      <div className="versusbar">
        <h3>{myPoke.name.charAt(0).toUpperCase() + myPoke.name.slice(1)}</h3>
        <img className="vsimg" src={pokeVS} alt="not found" />
        <h3>
          {enmyPoke.name.charAt(0).toUpperCase() + enmyPoke.name.slice(1)}
        </h3>
      </div>
      {gameStateDisplay(gameState)}
    </div>
  );
}

export default Pokefight;
