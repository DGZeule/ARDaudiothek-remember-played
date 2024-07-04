// ==UserScript==
// @name         ARDaudiothek - remember played titles
// @namespace    https://1fckeller.de/
// @version      2024-07-04
// @description  save and mark all paid titles so you can keep track of which episodes you already listened
// @author       Daniel Vogel
// @match        https://www.ardaudiothek.de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ardaudiothek.de
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let dlIndex=0;
    let played = JSON.parse(localStorage.getItem("titlesPlayed"))||[];

    markPlayedThumbs();
    setTimeout(markPlayedThumbs, 1000);
    setTimeout(markPlayedThumbs, 2000);


    let stl=document.createElement("style");
    stl.innerHTML=`.b1lt6zmg>a.b1e83sjn.played{
       filter:grayscale(80%);
    }`;
    document.head.appendChild(stl);


    setInterval(function(){
        let save=false, tmp,obj,id,dl=window.dataLayer;
        dlLoop: for(;dlIndex<dl.length;dlIndex++){
            if(dl[dlIndex].event!="av.stop")continue;
            tmp=dl[dlIndex].av_metadaten.properties;
            obj={title:tmp.av_content, contentId:tmp.av_content_id};

            //prevent duplicates
            for(let i=0;i<played.length;i++){
                if(played[i].contentId==obj.contentId)continue dlLoop;
            }
            if(id=getId(obj.contentId))obj.id=id;
            played.push(obj);
            save=true;
        }
        if(save){
            localStorage.setItem("titlesPlayed", JSON.stringify(played));
            markPlayedThumbs();
        }
    },1000);


    function getId(coreId){
        let n=window.__NEXT_DATA__.props.pageProps.initialData.data.result.items.nodes;
        for(let i=0;i<n.length;i++){
            if(n[i].coreId==coreId){
                return n[i].id;
            }
        }
        return false;
    }

    function markPlayedThumbs(){
        console.log("played:", played);
        let thumbs=document.querySelectorAll(".b1lt6zmg a.b1e83sjn"),m,id,i,j;
        for(i=0;i<thumbs.length;i++){
            if(m=thumbs[i].href.match(/\/(\d+)\//)){
                id=m[1];
                for(j=0;j<played.length;j++){
                    if(played[j].id==id){
                        console.log("found thumb id:", id,thumbs[i]);
                        thumbs[i].classList.add("played");
                    }
                }
            }
        }
    }
})();
