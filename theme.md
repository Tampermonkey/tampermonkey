// ==UserScript==
// @name         Theme by Away
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.tankionline.com/play/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tankionline.com
// @grant           GM_addElement
// @resource        home.entrance1 https://i.yapx.cc/Mw9VM.gif
// @resource        home.entrance https://usagif.com/wp-content/uploads/gif/outerspace-70.gif
// @grant           GM_getResourceURL
// @run-at          document-body
// ==/UserScript==

document.title = "theme by Away";
(function() {
    'use strict';
    var style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
    div[style*="background: linear-gradient(rgba(0, 25, 38, 0) 0%, rgba(0, 25, 38, 0.75) 100%); bottom: 0px; height: 50%; position: absolute; width: 100%"] {
    display: none !important;
}

div[data-style="BattleTabStatisticComponentStyle-containerInsideTeams BattleTabStatisticComponentStyle-containerInside Common-flexStartAlignCenterColumn Common-displayFlexColumn Common-displayFlex Common-alignCenter"] {
    width: 105em !important;
  }
.BattleTabStatisticComponentStyle-container .BattleTabStatisticComponentStyle-containerInsideTeams, .wrapper .BattleTabStatisticComponentStyle-containerInsideResults {
	backdrop-filter: blur(7px) !important;
	background: #00000063;
	border-top-left-radius: 10px;
	border-bottom-right-radius: 10px;
	border: 1px solid rgb(160 124 183);
}
.BattleTabStatisticComponentStyle-container:hover .BattleTabStatisticComponentStyle-containerInsideTeams {
    opacity: 1;
    visibility: visible;
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:first-child {
    justify-content: center;
    text-align: center;
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:first-child:hover {
    text-align: center;
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:nth-child(2)>div>div:first-child tbody>tr {
    background: rgba(142, 136, 120, 0.07);
    border-radius: 0.8em;
    border: 0.5px solid #e7e7e4;
    transition: 0.2s;
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:nth-child(2)>div>div:first-child tbody>tr td:first-child {
    min-width: 12em;
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:nth-child(2)>div>div:first-child tbody>tr.BattleTabStatisticComponentStyle-selectedRowBackGround {
    background: rgb(255 255 255 / 35%);
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:nth-child(2)>div>div:last-child tbody>tr {
    background: rgba(142, 136, 120, 0.07);
    border-radius: 0.8em;
    border: 0.5px solid #e7e7e4;
    transition: 0.2s;
}

.BattleTabStatisticComponentStyle-containerInsideTeams>div:nth-child(2)>div>div:last-child tbody>tr td:first-child {
    min-width: 12em;
}
.BattleTabStatisticComponentStyle-selectedRowBackGround {
	background-color: rgb(139 139 139 / 25%) !important;
}
.BattleTabStatisticComponentStyle-rowBackGround {
	background-color: rgb(53 53 53 / 25%)!important;
}
.BattleTabStatisticComponentStyle-containerInsideTeams:after {
	bottom: 0.5em;
    color: hsl(0deg 0% 100%);
    content: "by Away";
    position: absolute;
    right: 0.5em;
}

.ContextMenuStyle-menu {
    border: 2px solid rgba(50, 255, 126, 0.7);
    border-radius: 5px;
}

.ContextMenuStyle-menu>div {
    font-weight: 700;
    text-shadow: 0 0 10px hsla(0, 0%, 100%, 0.6);
}

.ContextMenuStyle-menu>div:first-child {
    text-shadow: none;
}

.ContextMenuStyle-menu>div:last-child {
    text-shadow: 0 0 10px #ff2e2e;
}

.BattleTabStatisticComponentStyle-resistanceModuleCell {
    min-width: 10em;
    visibility: unset !important;
    width: 10em !important;
}

/*основная тема
*/
html {
background: black
}
body{
	background: radial-gradient(50% 100% at 50% 100%, #111111 0%, #0b0a0a 100%)!important;
}
body h2 {
	color: #0099FF !important;
}
body h1 {
	color: #0099FF !important;
}
body p {
	color: #0099FF !important;
}
body h4 {
	color: #0099FF !important;
}
#modal-root .modal .TooltipStyle-tooltip {
    background-color: #00000063;
    border: 0.063em solid rgba(187, 0, 245, 0.25);
    border-radius: 10px;
}
modal-root .modal .AccountSettingsComponentStyle-blockTextOptions h1 {
    color: #bf16bf !important;
}
.wrapper .BattleMessagesComponentStyle-message {
color: #ea3028 !important;
    background: rgb(26 26 26 / 32%);
    border-radius: 20px;
    border: 1px solid #ea3028;
}
.ModalStyle-rootHover .RankupComponentStyle-wrapper {
	width: 50% !important;
	background: transparent !important;
}

.ModalStyle-root .InvitationWindowsComponentStyle-commonBlockButton {
    background: #0000006e;
    margin-bottom: 2%;
    border: 1px solid black;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-root .InvitationWindowsComponentStyle-commonBorder {
    background: #0000006e;
    margin-bottom: 2%;
    border: 1px solid black;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-root .InvitationWindowsComponentStyle-commonItem {
 background: transparent;
}
.Common-container .Common-entranceGradient {
background: transparent;
}
.wrapper .MatchmakingWaitComponentStyle-container {
backdrop-filter: blur(2.5px);
    border: 1px solid black;
    top: 8%;
        width: 28%;
        height: 12%;
    right: 35%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: #00000042;
    display: flex; align-items: center;
}
.PrimaryMenuItemComponentStyle-itemName { display: none; }

.Common-container .UserInfoContainerStyle-userNameRank:hover
{
	color: #0099FF !important;
}

.Common-container .MainScreenComponentStyle-blockMainMenu ul {
flex-direction: row;
}

.LobbyLoaderComponentStyle-container {
	backdrop-filter: blur(3px) !important;
	background: linear-gradient(0deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%) !important;
}
.Common-container .ClanInfoComponentStyle-messageClan {
	backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 98%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .ClanInfoComponentStyle-messageClan:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanInfoComponentStyle-messageClan:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	background: rgb(0 0 0 / 67%) !important;
    border: 1px solid white;
}
.Common-container .ClanInfoComponentStyle-messageClan:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanInfoComponentStyle-messageClan:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .ClanHeaderComponentStyle-blockInform {
	backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 98%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .ClanHeaderComponentStyle-blockInform:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanHeaderComponentStyle-blockInform:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	background: rgb(0 0 0 / 67%) !important;
    border: 1px solid white;
}
.Common-container .ClanHeaderComponentStyle-blockInform:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanHeaderComponentStyle-blockInform:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .UserInfoContainerStyle-blockForIconTankiOnline {
    display: none;
    align-items: center;
    flex-direction: column;
}

.Common-container .Common-flexSpaceBetweenAlignCenterColumn {
    width: 100%;
    box-sizing: border-box;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-navigationButton {
backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 98%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-navigationButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

.ModalStyle-rootHover .TutorialModalComponentStyle-navigationButton:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	background: rgb(0 0 0 / 67%) !important;
    border: 1px solid white;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-navigationButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-navigationButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.ModalStyle-rootHover .TutorialModalComponentStyle-contentWrapper{
backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 98%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-contentWrapper:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-contentWrapper:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	background: rgb(0 0 0 / 67%) !important;
    border: 1px solid white;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-contentWrapper:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .TutorialModalComponentStyle-contentWrapper:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .TableMainQuestComponentStyle-commonTableMainQuest {
backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 96%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .TableMainQuestComponentStyle-commonTableMainQuest:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .TableMainQuestComponentStyle-commonTableMainQuest:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	background: rgb(0 0 0 / 67%) !important;
    border: 1px solid white;
}
.Common-container .TableMainQuestComponentStyle-commonTableMainQuest:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .TableMainQuestComponentStyle-commonTableMainQuest:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .CssCommonAnimations-appearFromLeft {
    position: static;
}

.ModalStyle-rootHover .ModalStyle-marginLeftZero .ClanInvitationsComponentStyle-invitationContent {
	background: radial-gradient(50% 100% at 50% 100%, rgb(160 124 183) 0%, rgb(160 124 183) 100%) !important;
}
.Common-container .GearScoreStyle-bestGS{
	margin: 7px;
}
.Common-container .BattleTableStyle-fullBattleUsersBlock {
	color: rgb(160 124 183) !important;
}
.Common-container .ListItemsComponentStyle-itemsContainer{
	background: transparent !important;
}

.Common-container.Common-entranceBackground, .Common-background, .Common-changingBackground {
    background-image: url(${GM_getResourceURL('home.entrance1')}) !important;
        background-size: cover !important;
    background-position: center !important;
}

.Common-container {
    background-image: url(${GM_getResourceURL('home.entrance')}) !important;
        background-size: cover !important;
    background-position: center !important;
}
.Common-container .TableMainQuestComponentStyle-timerTable span {
	color: white !important;
}
.ScrollingCardsComponentStyle-scrollCardPick {
	display: flex;
    \
}
.Common-container .MountedItemsStyle-resistanceContainer {
	height: 0px;
}
.Common-container .MainQuestComponentStyle-cardPlay {
    backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 16.5em;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .MainQuestComponentStyle-cardPlay:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .TierItemComponentStyle-getItemNow {
	border: 1px solid rgba(146, 148, 248, 0.8) !important;
}
.Common-container .MainQuestComponentStyle-cardPlay:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .MainQuestComponentStyle-cardPlay:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MainQuestComponentStyle-cardPlay:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .TankParametersStyle-leftParamsContainer {
	backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 16.5em;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .TankParametersStyle-leftParamsContainer:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .TierItemComponentStyle-getItemNow {
	border: 1px solid rgba(146, 148, 248, 0.8) !important;
}
.Common-container .TankParametersStyle-leftParamsContainer:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .TankParametersStyle-leftParamsContainer:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .TankParametersStyle-leftParamsContainer:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .ScrollingCardsComponentStyle-scrollCard{
    top: 15%;
    height: 64%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.Common-container .ScrollingCardsComponentStyle-scrollCard:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ScrollingCardsComponentStyle-scrollCard:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	border: 1px solid white;
}
.Common-container .ScrollingCardsComponentStyle-scrollCard:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ScrollingCardsComponentStyle-scrollCard:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .MainScreenComponentStyle-containerPanel {
	display: flex;
    align-items: center;
    border-bottom: 0px solid rgba(255, 255, 255, 0.25)!important;
    box-shadow: rgba(255, 255, 255, 0.25) 0px 0em 0em 0em;
}
.Common-container .BreadcrumbsComponentStyle-backButton {
	box-shadow: rgba(255, 255, 255, 0.25) 0px 0em 0em 0em;
}
.Common-container .BreadcrumbsComponentStyle-headerContainer {
	border-bottom: 0px solid rgba(255, 255, 255, 0.25) !important;
}
.QuestsChallengesComponentStyle-maxTierBlock {
	border-left: 0px solid rgba(255, 255, 255, 0.25) !important;
	border-bottom: 0px solid rgba(255, 255, 255, 0.25) !important;
}
.Common-container .FooterComponentStyle-marginEllips {
    width: 25%;
    height: 55%;
    align-self: flex-start;
    position: absolute;
    right: 1%;
    top: -11%;
    margin-left: 0px;
}

.Common-container .HotKey-commonBlockForHotKey {
	border-radius: 8.1875em;
	color: white !important;
	background-color: rgb(20 20 20) !important;
}
.Common-container .GearScoreStyle-fontSizeDigitGS {
	font-size: 2.5em;
}
.Common-container .BattleCreateComponentStyle-scrollBattlePick {
	height: calc((100% - 2em) - 25em);
    margin: 10%;
    margin-right: 1%;
    margin-left: 1%;
    margin-top: 5%;
}
.Common-container .Common-buttonQE {
	border-radius: 1em !important;
}
.Common-container .ScrollingCardsComponentStyle-selectCard {
	border-top: 0px !important;
}
.Common-container .BreadcrumbsComponentStyle-headerContainer{
    display: flex;
    align-items: flex-start;
}
.Common-container .ScrollBarStyle-leftScrollArrow {
	background: transparent !important;
}
.Common-container .ScrollBarStyle-rightScrollArrow{
	background: transparent !important;
}

.Common-container .QuestsChallengesComponentStyle-maxTierBlockFree {
	background: radial-gradient(170.14% 100% at 50% 100%, rgb(70 74 83 / 25%) 0%, rgb(0 0 0 / 0%) 100%) !important;
}
.Common-container .QuestsChallengesComponentStyle-tiers{
	background: radial-gradient(100% 100% at 100% 100%, rgb(0 0 0 / 25%) 0%, rgb(0 0 0 / 0%) 100%)!important;
}
.Common-container .QuestsChallengesComponentStyle-blockGradient {
	background-image: radial-gradient(170.14% 100% at 50% 0%, rgb(7 7 7 / 75%) 0%, rgb(30 30 30 / 50%) 50%, rgba(255, 51, 51, 0) 100%) !important;
}
.Common-container .QuestsChallengesComponentStyle-premiumTier {
	background: radial-gradient(100% 100% at 100% 0%, rgb(0 0 0 / 50%) 0%, rgb(0 0 0 / 25%) 68.57%, rgba(255, 51, 51, 0) 100%) !important;
}
.Common-container .ChallengePurchaseComponentStyle-buttonBattlePass {
	border-radius: 6.5em;
}
.ModalStyle-rootHover .MainQuestComponentStyle-buttonContainer {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .MainQuestComponentStyle-buttonContainer:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .MainQuestComponentStyle-buttonContainerectedCard:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .MainQuestComponentStyle-buttonContainer:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .MainQuestComponentStyle-buttonContainer:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .UserTitleComponentStyle-premiumButton {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .UserTitleComponentStyle-premiumButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .UserTitleComponentStyle-premiumButton:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4);
	background: rgb(87 87 87 / 10%) !important;
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .UserTitleComponentStyle-premiumButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .UserTitleComponentStyle-premiumButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .FormatsSectionComponentStyle-unSelectedCard {
backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.Common-container .FormatsSectionComponentStyle-unSelectedCard:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-unSelectedCard:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .FormatsSectionComponentStyle-unSelectedCard:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-unSelectedCard:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .MainQuestComponentStyle-progress {
	height: 0px;
}
.ModalStyle-rootHover .Common-displayFlex {
	background: #02020296;
	border-radius: 0px;
    border-top-left-radius: 15px;
    border-bottom-right-radius: 15px;
}
.Common-container .Common-displayFlex {
	background: transparent !important;
}
.Common-container .SettingsComponentStyle-scrollingMenu {
	background-color: rgb(0 0 0 / 10%);
}
.ModalStyle-rootHover .Need2FaDialogComponentStyle-container {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
    border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid rgb(160 124 183) !important;
}
.ModalStyle-rootHover .Need2FaDialogComponentStyle-container span {
	color: white;
}
.ModalStyle-rootHover .Need2FaDialogComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .Need2FaDialogComponentStyle-container:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4) !important;
	border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid white !important;
}
.ModalStyle-rootHover .Need2FaDialogComponentStyle-container:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .Need2FaDialogComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .PopupMessageComponentStyle-buttonsContainer div span {
	color: white;
}
.ModalStyle-rootHover .PopupMessageComponentStyle-buttonsContainer div {
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
    border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid rgb(160 124 183) !important;
}
.ModalStyle-rootHover .PopupMessageComponentStyle-buttonsContainer div:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .PopupMessageComponentStyle-buttonsContainer div:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4) !important;
	border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid white !important;
}
.ModalStyle-rootHover .PopupMessageComponentStyle-buttonsContainer div:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .PopupMessageComponentStyle-buttonsContainer div:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .UserProgressComponentStyle-buttonOk {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
    border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid rgb(160 124 183) !important;
}
.ModalStyle-rootHover .UserProgressComponentStyle-buttonOk:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .UserProgressComponentStyle-buttonOk:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4) !important;
	border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid white !important;
}
.ModalStyle-rootHover .UserProgressComponentStyle-buttonOk:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .UserProgressComponentStyle-buttonOk:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton {
backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton:active {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton:active:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton:hover {
box-shadow: 1px 1px 10px 2px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-enabledButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-dialogFooter {
	background: transparent;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-redMenuButton:hover {
	box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: #7391fd78;
    border-bottom-right-radius: 20px;
}
.Common-container .JoinToBattleComponentStyle-newButtonJoinA .JoinToBattleComponentStyle-buttonJoin {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}

.Common-container .Common-activeMenu:hover {
    color: rgb(183 168 224);
}
.Common-container .Common-activeMenu {
	color: #0099FF;
}
.Common-container .Common-menuItemActive {
	color: rgb(183 168 224);
}
.Common-container .MenuComponentStyle-mainMenuItem:hover{
	color: rgb(183 168 224);
}
.Common-container .MainQuestComponentStyle-container {
	border: 1px solid white;
	background-color: rgb(147 147 147 / 7%);
    border-radius: 20.25em;
}
.Common-container .MainQuestComponentStyle-container:hover {
	border: 1px solid rgb(183 168 224);
	background-color: rgb(147 147 147 / 7%);
    border-radius: 20.25em;
    border: 1px solid white;
}
.Common-container .Common-flexCenterAlignCenter {
	border: 0px solid rgba(255, 255, 255, 0.25) !important;
	background-color: rgb(0 0 0 / 0%);
    box-shadow: rgb(255 255 255) 0em 0em 0em 0px;
    background: linear-gradient(-90deg, rgb(160 124 183) 0%, rgba(0, 0, 0, 0) 0%);
    color: rgb(90 90 90) !important;
}
.UserInfoContainerStyle-rankIconContainerClickable {
	border: 0px solid rgba(255, 255, 255, 0.25) !important;
}
.HeaderCommonStyle-icons {
	border-bottom: 0px solid rgba(255, 255, 255, 0.25) !important;
}

.Common-container .ListItemsComponentStyle-itemsListContainer {
	background: transparent;
}
.Common-container .ClanCommonStyle-rowEmpty {
	background: black;
}
.ModalStyle-rootHover .ClanCommonStyle-rowEmpty {
	background: black ;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-sendButton {
	backdrop-filter: blur(3px) !important;
    right: 0.5%;
    color white;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-sendButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-sendButton:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-sendButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-sendButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .ClanCommonStyle-row {
	backdrop-filter: blur(3px) !important;
    right: 0.5%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanCommonStyle-row:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanCommonStyle-row:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .ClanCommonStyle-row:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClanCommonStyle-row:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .ClanCommonStyle-row {
	backdrop-filter: blur(3px) !important;
    right: 0.5%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanCommonStyle-row:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanCommonStyle-row:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .ClanCommonStyle-row:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanCommonStyle-row:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .ClanInvitationsItemComponentStyle-buttonReject {
	backdrop-filter: blur(3px) !important;
    right: 0.5%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsItemComponentStyle-buttonReject:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsItemComponentStyle-buttonReject:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .ClanInvitationsItemComponentStyle-buttonReject:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsItemComponentStyle-buttonReject:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-invitationContent {
	backdrop-filter: blur(3px) !important;
    right: 0.5%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-invitationContent:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-invitationContent:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-invitationContent:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .ClanInvitationsComponentStyle-invitationContent:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .EntranceComponentStyle-buttonNoActive {
	border: 1px solid white !important;
	border-top-left-radius: 15px !important;
	border-bottom-right-radius: 15px !important;
}
.Common-container .DropDownStyle-dropdownControl {
    right: 0.5%;
    width: 14.5em;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .DropDownStyle-dropdownControl:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .DropDownStyle-dropdownControl:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .DropDownStyle-dropdownControl:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .DropDownStyle-dropdownControl:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .BattlePassLobbyComponentStyle-menuBattlePass{
backdrop-filter: blur(3px) !important;
    right: 0.5%;
    width: 18%;
    margin-top: 10em;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .BattlePassLobbyComponentStyle-menuBattlePass:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .BattlePassLobbyComponentStyle-menuBattlePass:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .BattlePassLobbyComponentStyle-menuBattlePass:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .BattlePassLobbyComponentStyle-menuBattlePass:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .AnnouncementHomeScreenComponentStyle-mainContainer {
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    bottom: 2.5%;
    right: 79.7%;
    background-color: rgb(160 124 183);
    border: 0.1em solid white;
}
.Common-container .AnnouncementHomeScreenComponentStyle-headerTimer span {
	color: rgb(255 255 255);
	font-size: 0.9em;
}

.Common-flexCenterAlignCenterColumn {
	background: linear-gradient(rgba(0, 25, 38, 0) 0%, rgb(0 0 0 / 0%) 0%) !important;
}
.AnnouncementHomeScreenComponentStyle-headerTimer {
	background-color: rgb(0 0 0 / 19%) !important;
}

.ApplicationLoaderComponentStyle-container .Common-flexCenterAlignCenterColumn{
    background-image: url(${GM_getResourceURL('home.entrance')}) !important;
	background: linear-gradient(rgba(0, 25, 38, 0) 0%, rgb(160 124 183) 100%);
	bottom: 0px;
	height: 50%;
	position: absolute;
	width: 100%;
}

.Common-container .GarageCommonStyle-animatedBlurredLeftBlock {
backdrop-filter: blur(0em);
}

.Common-container .PrimaryMenuItemComponentStyle-menuItemContainer {
top: -34%;
    left: 175%;
    margin: 1%;
    width: 12%;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    position: relative;
    overflow: hidden;
}

@keyframes glowing {
    0% { background-position: 0 0; }
    50% { background-position: 400% 0; }
    100% { background-position: 0 0; }
}


.BattleHudComponentStyle-hudButton {
    background: transparent;
}

.BattleHudComponentStyle-fullScreenButton {
backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 52%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.BattleHudComponentStyle-fullScreenButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattleHudComponentStyle-fullScreenButton:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px
    border: 1px solid white;
}
.BattleHudComponentStyle-fullScreenButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattleHudComponentStyle-fullScreenButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.BattleHudComponentStyle-pauseButton {
    backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 52%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.BattleHudComponentStyle-pauseButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattleHudComponentStyle-pauseButton:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.BattleHudComponentStyle-pauseButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattleHudComponentStyle-pauseButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.BattleHudComponentStyle-tabButton {
    backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 52%;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.BattleHudComponentStyle-tabButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattleHudComponentStyle-tabButton:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.BattleHudComponentStyle-tabButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattleHudComponentStyle-tabButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.BattleResultHeaderComponentStyle-flashLight{
	background: radial-gradient(50% 100% at 50% 0%, rgb(0 0 0 / 25%) 0%, rgb(0 0 0 / 0%) 100%) !important;
}

.BattleKillBoardComponentStyle-tableContainer table tbody #blueCommand {
    background-color: rgb(65 65 65 / 15%) !important;
}


.BattleKillBoardComponentStyle-tableContainer table tbody #enemyCommand {
    background-color: rgb(178 178 178 / 15%) !important;
}

.DialogContainerComponentStyle-container {
    border: 1px solid white;
        backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 52%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.DialogContainerComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.DialogContainerComponentStyle-container:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.DialogContainerComponentStyle-container:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.DialogContainerComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.BattleChatComponentStyle-rootDesktop .BattleChatComponentStyle-btnToggleTeamAllies {
	border-top-left-radius: 4.5em;
    border-bottom-left-radius: 4.5em;
}
.BattleChatComponentStyle-rootDesktop .BattleChatComponentStyle-inputContainerAllies {
	border-radius: 2em;background-color: rgba(0, 10, 15, 0.5);
    border: 2px solid rgb(160 124 183);
}
.BattleChatComponentStyle-rootDesktop .BattleChatComponentStyle-blueTeamColor {
	color: rgb(130 191 250);
}
.BattleChatComponentStyle-rootDesktop .BattleChatComponentStyle-inputContainerAll {
	border-radius: 2.5em;
	background-color: rgba(0, 10, 15, 0.5);
    border: 2px solid rgb(160 124 183);
}
.BattleChatComponentStyle-rootDesktop .BattleChatComponentStyle-btnToggleTeamAll {
	    border-top-left-radius: 4em;
    border-bottom-left-radius: 4em;
    background-color: rgba(255, 255, 255, 0.15);
}
.ModalStyle-rootHover .BattlePickComponentStyle-commonStyleBlock {
    border: 1px solid white;
	backdrop-filter: blur(3px) !important;
    border-radius: 1px;
    background: transparent !important;
    text-decoration: none;
	border: 1px solid rgb(160 124 183);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .BattlePickComponentStyle-commonStyleBlock:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .BattlePickComponentStyle-styleIsEnableBlock:hover{
	box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	border: 1px solid white;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .BattlePickComponentStyle-styleIsEnableBlock:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border: 1px solid white
    border-bottom-right-radius: 20px;
}
.BattlePickComponentStyle-commonStyleBlock:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.BattlePickComponentStyle-commonStyleBlock:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.BattlePickComponentStyle-commonStyleBlock:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.BattlePickComponentStyle-modeCards:hover .BattlePickComponentStyle-cardContentLeft {
    opacity: 1;
}
.BattlePickComponentStyle-modeCards .BattlePickComponentStyle-cardContentRight {
    transition: opacity 0.6s ease-in-out;
}
.BattlePickComponentStyle-modeCards:hover .BattlePickComponentStyle-cardContentRight {
    opacity: 1;
}
.Common-container .UsersTableStyle-rowBattle {
    background-color: rgb(35 35 35 / 25%);
}
.Common-container .UsersTableStyle-rowBattleEmpty {
    background-color: rgb(0 0 0 / 10%);
}
.Common-container .UsersTableStyle-emptyRow span{
	color: rgb(255 255 255);
}

.Common-container .MainScreenComponentStyle-playButtonContainer span {
	color: rgb(255 255 255);
}
.Common-container .MainScreenComponentStyle-playButtonContainer {
backdrop-filter: blur(0em);
    background: transparent !important;
    text-decoration: none;
    border-radius: 0px;
width: 50%;
    height: 30%;
    left: 165%;
    top: -72%;
    box-shadow: rgb(118 255 51 / 0%) 0em 0em 0em 0.063em;
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}

#modal-root > div {
    pointer-events: auto;
}
#root.wrapper .ChatComponentStyle-closeArea {
backdrop-filter: blur(4px);
}
.Common-container .NewsComponentStyle-closeArea {
	backdrop-filter: blur(4px);
}
.ModalStyle-rootHover .cardImgEvents:hover .BattlePickComponentStyle-cardImg{
	backdrop-filter: blur(3px) !important;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}
.ModalStyle-rootHover.cardImgEvents:hover .BattlePickComponentStyle-cardImg:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .cardImgEvents:hover .BattlePickComponentStyle-cardImg:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .cardImgEvents:hover .BattlePickComponentStyle-cardImg:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .cardImgEvents:hover .BattlePickComponentStyle-cardImg:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.Common-container .FooterComponentStyle-footer {
  margin-bottom: 10px;
    left: 110%;
    top: -90%;
    width: 50%;
}
.Common-container .FooterComponentStyle-footer li {
    backdrop-filter: blur(3px) !important;
    text-decoration: none;
    margin-left: 8px;
    position: relative;
    overflow: hidden;
}
.Common-container .FooterComponentStyle-footer li:before {
  content: "";
  position: absolute;
}

.Common-container .FooterComponentStyle-footer .FooterComponentStyle-containerMenu:hover {
	border-radius: 15px;
    border: 1px solid white;
}
.Common-container .MainScreenComponentStyle-blockMainMenu {
margin-left: 0%;
margin-top: -9%;

}

.Common-container .FooterComponentStyle-footer:hover {

}
.Common-container .FooterComponentStyle-footer:hover:before {
	opacity: 1;
	border-top-left-radius: 15px;
    border-bottom-right-radius: 15px;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted {
backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-radius: 0px;
    background: transparent;
    height: 30%;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted:active {
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
	transition: all 650ms;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted:active:after {
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
	transition: all 650ms;
}
.Common-container .UserProgressComponentStyle-progressItemUncompleted:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}

.Common-container .FooterComponentStyle-footer li:after {
    z-index: -1;
    content: '';
    position: absolute;
    background: transparent;
}

@keyframes glowing {
    0% { background-position: 0 0; }
    50% { background-position: 400% 0; }
    100% { background-position: 0 0; }
}
.Common-container .DropDownStyle-outerContainerStyle {
	    border-radius: 0px;
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
    backdrop-filter: blur(3px) !important;
}
.Common-container .DropDownStyle-outerContainerStyle:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .DropDownStyle-outerContainerStyle:active {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .DropDownStyle-outerContainerStyle:active:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .DropDownStyle-outerContainerStyle:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.NewsComponentStyle-newsWindow {
	background: radial-gradient(50% 100% at 50% 100%, rgb(160 124 183) 0%, rgb(160 124 183) 100%);
}
.Common-container .Font-medium{
	box-shadow: rgb(255 255 255) 0em 0em 0em 0px !important;
    background: linear-gradient(-90deg, rgb(160 124 183) 0%, rgba(0, 0, 0, 0) 0%) !important;
}
.Common-container .Common-flexStartAlignCenter {
background: transparent;
}

.Common-container .KeyboardSettingsComponentStyle-keyInput {
background:transparent;
}
.Common-container .Common-flexStartAlignCenter .Common-flexWrapNowrap .modeLimitIcon {
	background: linear-gradient(270deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 0%) 100%) !important;
    box-shadow: rgb(255 255 255) 0em 0em 0em 2px !important;
}
.Common-container .FriendListComponentStyle-topString {
    margin-top: 1%;
}
.Common-container .UserProgressComponentStyle-progressItemCompleted {
    text-decoration: none;
    border-radius: 0px;
    background: #54545440;
    backdrop-filter: blur(10px);
    height: 30%;
	border: 1px solid rgb(160 124 183);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	position: relative;
	overflow: hidden;
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
	border: 1px solid white;
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:active:before {
	background: transparent !important;
	border: 1px solid rgb(160 124 183);
	box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:active {
	background: transparent !important;
	border: 1px solid rgb(160 124 183);
	box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:active:after {
	background: transparent !important;box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
}
.Common-container .UserProgressComponentStyle-progressItemCompleted:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.Common-container .MainScreenComponentStyle-playButtonContainer {

}
.Common-container .MainScreenComponentStyle-playButtonContainer:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: transparent;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MainScreenComponentStyle-playButtonContainer:hover {
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    box-shadow: rgb(0 0 0 / 0%) 0em 0em 0em 0.063em;
    border: 1px solid pink;
}
.Common-container .MainScreenComponentStyle-playButtonContainer:hover:before {
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MainScreenComponentStyle-playButtonContainer:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.Common-container .UserProgressComponentStyle-progressLegendPlus {
	box-shadow: rgb(255 255 255) 0px 0px 0px 1px !important;
	height: 40%;
}
.ModalStyle-rootHover .UserProgressComponentStyle-modalWrapper{
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    width: 60%;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .UserProgressComponentStyle-modalWrapper:before{
    content: "";
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
}
.ModalStyle-rootHover .UserProgressComponentStyle-modalWrapper:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .UserProgressComponentStyle-modalWrapper:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .UserProgressComponentStyle-modalWrapper:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.EmptyShopSpecialOfferComponentStyle-container {
	box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
}
.Common-container .InputRangeComponentStyle-range {
	background: #80808033 !important;
}
.Common-container .KeyboardSettingsComponentStyle-keyInput input{
backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}
.Common-container .KeyboardSettingsComponentStyle-keyInput input:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .KeyboardSettingsComponentStyle-keyInput input:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .KeyboardSettingsComponentStyle-keyInput input:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .KeyboardSettingsComponentStyle-keyInput input:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.Common-container .AccountSettingsComponentStyle-blockInputEmail input {
backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}
.Common-container .AccountSettingsComponentStyle-blockInputEmail input:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .AccountSettingsComponentStyle-blockInputEmail input:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .AccountSettingsComponentStyle-blockInputEmail input:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .AccountSettingsComponentStyle-blockInputEmail input:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.Common-container .AccountSettingsComponentStyle-blockChangePassword input {
	backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}
.AccountSettingsComponentStyle-blockChangePassword input:before{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.AccountSettingsComponentStyle-blockChangePassword input:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .AccountSettingsComponentStyle-blockChangePassword input:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .AccountSettingsComponentStyle-blockChangePassword input:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.ModalStyle-rootHover .UserProgressComponentStyle-itemContainer{
	backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
  position: relative;
  overflow: hidden;
}
.ModalStyle-rootHover .UserProgressComponentStyle-itemContainer:before{
    content: "";
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    transition: all 650ms;
}
.ModalStyle-rootHover .UserProgressComponentStyle-itemContainer:hover {
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .UserProgressComponentStyle-itemContainer:hover:before {
opacity: 1;
    left: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .UserProgressComponentStyle-itemContainer:after{
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
    left: 0;
    top: 0;
}
.ModalStyle-rootHover .ScrollBarStyle-leftScrollArrow{
	background: transparent !important;
}
.ModalStyle-rootHover .ScrollBarStyle-rightScrollArrow{
	background: transparent !important;
}
.Common-container .UserProgressComponentStyle-rankScore {
    color: rgb(255 255 255) !important;
}
.Common-container .UserProgressComponentStyle-rankProgressLegend{
	color: rgb(255 255 255) !important;
}
.Common-container .UserProgressComponentStyle-rankProgressBarContainerLegend{
	margin-top: -3%;
}
.Common-flexSpaceBetween .Common-flexStartAlignStart{
	margin-top: -3.65%;
}
.Common-container .LockableContainersComponentStyle-possibleRewardsBlock {
	backdrop-filter: blur(3px) !important;
    right: 18%;
    box-shadow: rgb(213 128 255 / 0%) 0em 0em 0em 1px;
    background: transparent;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .LockableContainersComponentStyle-possibleRewardsBlock:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .LockableContainersComponentStyle-possibleRewardsBlock:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
        border: 1px solid white;
}
.Common-container .LockableContainersComponentStyle-possibleRewardsBlock:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .LockableContainersComponentStyle-possibleRewardsBlock:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .EventBattlePassLobbyComponentStyle-buttonEventBattlePass{
backdrop-filter: blur(3px) !important;
    right: 0.5%;
    width: 17%;
    margin-top: 12.5em;
    height: 9.3em;
    box-shadow: rgb(213 128 255 / 0%) 0em 0em 0em 1px;
    background: transparent;
    text-decoration: none;
    border-radius: 0px;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .EventBattlePassLobbyComponentStyle-buttonEventBattlePass:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .EventBattlePassLobbyComponentStyle-buttonEventBattlePass:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
        border: 1px solid white;
}
.Common-container .EventBattlePassLobbyComponentStyle-buttonEventBattlePass:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .EventBattlePassLobbyComponentStyle-buttonEventBattlePass:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .ChallengeTimerComponentStyle-textTime{
	border-radius: 1em;
	background-color: transparent;
    color: white;
}
.Common-container .EventBattlePassLobbyComponentStyle-commonBlockProgressBar {
    background-color: rgb(0 0 0 / 0%) !important;
}
.Common-container .EventBattlePassLobbyComponentStyle-descriptionEventPass h3 {
    color: rgb(255 255 255) !important;
}
.Common-container .ChallengeBarInfoComponentStyle-commonBlockTier span {
    color: rgb(255 255 255) !important;
}
.Common-container .ChallengeBarInfoComponentStyle-parametersStars h3{
	color: rgb(255 255 255) !important;
}
.Common-container .QuestsChallengesComponentStyle-blockGradientEvent {
    background-image: radial-gradient(170.83% 50% at 0% 50%, rgb(0 0 0 / 75%) 0%, rgb(0 0 0 / 50%) 50%, rgba(255, 51, 51, 0) 100%) !important;
}
.Common-container .QuestsChallengesComponentStyle-eventTier{
	background: radial-gradient(100% 50% at 100% 50%, rgb(8 8 8 / 50%) 0%, rgb(0 0 0 / 25%) 68.57%, rgba(255, 51, 51, 0) 100%) !important;
}
.Common-container .MountedItemsStyle-commonBlockDrone {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .MountedItemsStyle-commonBlockDrone:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockDrone:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockDrone:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockDrone:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .UsersTableStyle-centerCell {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
    margin: 2.5px;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.Common-container .UsersTableStyle-centerCell:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UsersTableStyle-centerCell:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.Common-container .UsersTableStyle-centerCell:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UsersTableStyle-centerCell:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .ProBattlesComponentStyle-createBattleButton {
    background-color: rgb(146 148 248 / 21%);
}
.Common-container .IconStyle-iconAddBattle {
	background: rgb(139 191 255);
}
.Common-container .Common-maskImageContain {
	background: rgb(139 191 255);
}
.Common-container .TableComponentStyle-table thead tr th {
	background: transparent;
}
.Common-container .Font-normal {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
    margin: 2.5px;
}
.Common-container .LargeShowcaseItemComponentStyle-container {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
}
.Common-container .LargeShowcaseItemComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .LargeShowcaseItemComponentStyle-container:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
}
.Common-container .LargeShowcaseItemComponentStyle-container:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .LargeShowcaseItemComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.modal .ContextMenuStyle-menu {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.modal  .ContextMenuStyle-menu:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.modal  .ContextMenuStyle-menu:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.modal  .ContextMenuStyle-menu:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.modal  .ContextMenuStyle-menu:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .ClanCreateComponentStyle-blockCreatureClan {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    width: 50%;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.Common-container .ClanCommonStyle-content {
	background: transparent;
}
.Common-container .FriendListComponentStyle-blockList {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.Common-container .FriendListComponentStyle-blockList:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FriendListComponentStyle-blockList:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.Common-container .FriendListComponentStyle-blockList:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FriendListComponentStyle-blockList:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-enterButton {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: black !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-enterButton span {
	color: white;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-enterButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-enterButton:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.ModalStyle-rootHover .DialogContainerComponentStyle-enterButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-enterButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-keyButton {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-keyButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-keyButton:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.ModalStyle-rootHover .DialogContainerComponentStyle-keyButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .DialogContainerComponentStyle-keyButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .ClosedContainerStyle-backButton {
backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.Common-container .ClosedContainerStyle-backButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClosedContainerStyle-backButton:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.Common-container .ClosedContainerStyle-backButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ClosedContainerStyle-backButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .MountedItemsStyle-commonBlockPaint {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    border: 1px solid rgb(160 124 183);
}
.Common-container .MountedItemsStyle-commonBlockPaint:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockPaint:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.Common-container .MountedItemsStyle-commonBlockPaint:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockPaint:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .MountedItemsStyle-commonBlockForTurretsHulls {
backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .MountedItemsStyle-commonBlockForTurretsHulls:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockForTurretsHulls:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockForTurretsHulls:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MountedItemsStyle-commonBlockForTurretsHulls:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .SuppliesComponentStyle-cellAdd {
    backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .SuppliesComponentStyle-cellAdd:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .SuppliesComponentStyle-cellAdd:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;
}
.Common-container .PrimaryMenuItemComponentStyle-notificationIconNewNews {
	width: 30%;
    height: 50%;
    left: 70%;
    top: -9%;
    margin-right: 0.625em;
    position: absolute;
    right: -3%;
}
.wrapper .NotificationViewStyle-commonBlockNotification {

margin-top: 21%;
}

.Common-container .SuppliesComponentStyle-cellAdd:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .SuppliesComponentStyle-cellAdd:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}

.Common-container .ItemNotificationMarkerStyle-base {
	background-color: rgb(255, 255, 255) !important;
}
.Common-container .MenuComponentStyle-battleTitleCommunity span{
	background: #f1f1f1  !important;
}
.Common-container .PrimaryMenuItemComponentStyle-discountNotification{
	background-color: transparent !important;
	color: rgb(255 255 255) !important;
}
.Common-container .BreadcrumbsComponentStyle-backButton h3 {
	border-radius: 1em;
}
.Common-container .SmallShowcaseItemComponentStyle-container {
    margin-right: 0px;
    background: #80808026 !important;
    border: 1px solid rgb(160 124 183);
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-container .SmallShowcaseItemComponentStyle-container:hover {
	box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	background: black;
	border: 1px solid white !important;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;
}
.Common-container .ShopItemComponentStyle-headerContainer {
	background: rgb(172 172 172 / 5%) !important;
}
.Common-container .Common-flexSpaceBetweenAlignStartColumn {
	height: 63%;
    margin-top: 5.3%;
    backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .Common-flexSpaceBetweenAlignStartColumn:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-flexSpaceBetweenAlignStartColumn:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
background: transparent;;
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
        border: 1px solid white;
}
.Common-container .Common-flexSpaceBetweenAlignStartColumn:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-flexSpaceBetweenAlignStartColumn:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .Common-flexSpaceBetweenAlignStartColumn {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.ModalStyle-rootHover .Common-flexSpaceBetweenAlignStartColumn:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .Common-flexSpaceBetweenAlignStartColumn:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
background: transparent;;
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
        border: 1px solid white;
}
.ModalStyle-rootHover .Common-flexSpaceBetweenAlignStartColumn:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .Common-flexSpaceBetweenAlignStartColumn:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
}
.Common-container .UserProgressComponentStyle-rankProgressBarGained {
	color: white;
    font-size: 24px;
    border-right: 1px solid rgb(160 124 183);
    background: rgb(160 124 183)
    position: absolute;
    right: 0px;
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    height: 0%;
    background: #000000c2;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.Common-container .NewsComponentStyle-newsWindow {
    backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: #000000c2;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.UserProgressComponentStyle-rankGainedIndicator {
	border-right: 1px solid rgb(160 124 183);
}
.Common-container .MediumShowcaseItemComponentStyle-container {
    backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .MediumShowcaseItemComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MediumShowcaseItemComponentStyle-container:hover {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
        border: 1px solid white;
}
.Common-container .MediumShowcaseItemComponentStyle-container:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .MediumShowcaseItemComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .ShowcaseItemComponentStyle-header {
    background: #0000005e;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .shop-item-component:hover .ShopItemComponentStyle-headerContainer {
    background: rgba(255, 255, 255, 0.22)!important;
    border-radius: 10px;
    transition: background 1s ease 0s;
}
.Common-container .shop-item-component:hover .ShopItemComponentStyle-headerContainer {
	background: rgba(255, 255, 255, 0.22) !important;
    border-radius: 10px;
}
.Common-container .ShopSpecialOfferSectionHeaderStyle-container {
	height: 6.313em;
    backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    border: 2px solid white;
    border-top-left-radius: 15px;
    border-bottom-right-radius: 15px;
    text-decoration: none;
    background-color: rgb(160 124 183);
    box-shadow: rgb(255 255 255) 0px 0px 0.676em;
}
.ModalStyle-rootHover .SuccessfulPurchaseComponentStyle-container {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .SuccessfulPurchaseComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .SuccessfulPurchaseComponentStyle-container:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .SuccessfulPurchaseComponentStyle-container:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .SuccessfulPurchaseComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .HotKey-commonBlockForHotKey {
	border-radius: 5.1875em;
}
.Common-container .ShowcaseItemComponentStyle-disabledBackground {
    background: rgb(0 0 0 / 0.7);
    backdrop-filter: blur(2px);
    border: 1px solid rgb(160 124 183);
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ShopCategoryOfferSectionStyle-innerContainer {
    background-color: transparent;
    width: 98%;
}
.Common-container .LockableContainerInfoComponentStyle-lootBoxDescriptionContainer {
	background: transparent;
}
.Common-container .ContainersStyle-openBuyButton {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.Common-container .ContainersStyle-openBuyButton:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ContainersStyle-openBuyButton:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;
}
.Common-container .ContainersStyle-openBuyButton:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .ContainersStyle-openBuyButton:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .Common-flexSpaceBetween .UserProgressComponentStyle-rankProgressGeneral {
    color: white;
    font-size: 24px;
    border-right: rgb(160 124 183);
    margin-top: 0.3%;
    right: 1px;
    padding-top: 1px;
    padding-right: 10px;
    height: 30px;
    min-width: 150px;
    border: 1px solid white;
    border-top-left-radius: 15px;
    border-bottom-right-radius: 15px;
    background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
}
.Common-container .TanksPartComponentStyle-tankPartUpgrades {
	backdrop-filter: blur(0em);
}
.Common-container.MountedItemsComponentStyleMobile-commonButtonUpdate {
	background-color: rgb(0 0 0 / 25%) !important;
    box-shadow: rgb(255 255 255) 0em 0em 0em 0.05em;
}
.Common-container .TanksPartBaseComponentStyle-marginTop .MountedItemsComponentStyleMobile-buttonEstablished .MountedItemsComponentStyleMobile-commonButtonUpdate {
	background-color: rgb(0 0 0 / 61%);
	box-shadow: rgb(255 255 255) 0em 0em 0em 0.063em;
}
.Common-container .Common-itemStyle {
backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.Common-container .Common-itemStyle:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-itemStyle:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-itemStyle:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

.Common-container .Common-itemStyle:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .GarageCommonStyle-animatedBlurredRightBlock{
	backdrop-filter: blur(0em);
}
.Common-container .Common-flexCenterAlignCenterColumn .SkinCellStyle-widthHeight {
        backdrop-filter: blur(3px) !important;
    right: 1%;
    width: 52%;
    border-radius: 0px;
    background: transparent !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
  border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);;
}
.Common-container .Common-flexCenterAlignCenterColumn .SkinCellStyle-widthHeight:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-flexCenterAlignCenterColumn .SkinCellStyle-widthHeight:active {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-flexCenterAlignCenterColumn .SkinCellStyle-widthHeight:active:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .Common-flexCenterAlignCenterColumn .SkinCellStyle-widthHeight:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .ItemDescriptionComponentStyle-commonBlockModal {
	background: black !important;
}
.ModalStyle-rootHover .Common-flexCenterAlignCenter .TutorialModalComponentStyle-navigationButton .ItemDescriptionComponentStyle-blockButtons:hover {
	box-shadow: rgb(255 255 255) 0em 0em 0em 2px;
    border: 1px solid white;
}
.ModalStyle-rootHover .Common-flexCenterAlignCenter .TutorialModalComponentStyle-navigationButton .ItemDescriptionComponentStyle-blockButtons {
	box-shadow: rgb(255 255 255) 0em 0em 0em 2px;
}
.Common-container .ChatComponentStyle-closeArea {
	backdrop-filter: blur (3px);
}
.wrapper .ChatComponentStyle-chatWindow {
    border-radius: 0px;
    background: #000000ba !important;
    text-decoration: none;
  border: 1px solid rgb(160 124 183);
}
.Common-container .ChatComponentStyle-chatResize {
	background: transparent!important;
}
.Common-container .common-changingBackground {
	background-image:

.Common-container .SuperMissionComponentStyle-gradientBackground {
	background: transparent !important;
}
.Common-container .SuperMissionComponentStyle-descriptionSuperMission {
	background: transparent !important;
}
.Common-container .TableMainQuestComponentStyle-colorLockedGradientTable {
    background: transparent !important;
}
.TableMainQuestComponentStyle-colorLockedGradientTable:hover {
    background-color: rgb(0 0 0 / 80%) !important;
    border: 1px solid white;
}
.Common-container .TableMainQuestComponentStyle-cardRewardCompletedTable {
    background-color: rgb(39 39 39 / 37%) !important;
    box-shadow: rgb(255 255 255) 0px 0px 0px 0.063em;
}
.Common-container .TableMainQuestComponentStyle-cardRewardCompletedTable:hover {
    background-color: rgb(0 0 0 / 67%) !important;
    box-shadow: rgb(255 255 255) 0px 0px 0px 0.125em;
    border: 1px solid white;
}
.Common-container .ListItemsComponentStyle-itemsWrapper {
	background: transparent !important;
}
.notranslate {
	background: black !important;
}
.FormatsSectionComponentStyle-selectedCard {
    border-radius: 0px;
    box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
    background: transparent !important;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
    backdrop-filter: blur(3px) !important;
}
.Common-container .FormatsSectionComponentStyle-selectedCard:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-selectedCard:active {
box-shadow: 1px 1px 25px 10px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-selectedCard:active:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-selectedCard:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .FormatsSectionComponentStyle-card {
backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-top-left-radius: 20px;
  	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.Common-container .FormatsSectionComponentStyle-card:hover {
	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.Common-container .FormatsSectionComponentStyle-card:hover:before {
	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-card:hover:after {
	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-card:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-card:active {
box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-card:active:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .FormatsSectionComponentStyle-card:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-menuButton:hover {
	background: rgb(160 124 183);
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-selectedRedMenuButton {
	color: rgb(118 172 255) !important;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-redMenuButton {
	background: rgb(184 131 255 / 18%);
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container {
	background: black;
backdrop-filter: blur(3px) !important;
    background: transparent !important;
    text-decoration: none;
    border-top-left-radius: 20px;
  	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:hover {
	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid white;
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:hover:before {
	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:hover:after {
	box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:active {
box-shadow: 1px 1px 10px 3px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:active:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.ModalStyle-rootHover .RulesUpdatedComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-selectedMenuButton {
	background-color: rgb(9 128 255 / 20%) !important;
}
.ModalStyle-rootHover .BattlePauseMenuComponentStyle-menuButton {
	background: transparent;
}
.Common-container .UsersTableStyle-cellNameDM {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px !important;
    background: transparent !important;
    text-decoration: none;
    margin: 2.5px;
  border: 1px solid rgb(160 124 183) !important;
  border-top-left-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
}
.Common-container .UsersTableStyle-cellNameDM:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UsersTableStyle-cellNameDM:hover {
box-shadow: 1px 1px 10px 5px rgba(146, 148, 248, 0.4);
	border-top-left-radius: 20px;
	    border: 1px solid white;
	background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);;
    border-bottom-right-radius: 20px;

}
.Common-container .UsersTableStyle-cellNameDM:hover:after {
opacity: 1;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.Common-container .UsersTableStyle-cellNameDM:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}
.Common-container .FriendListComponentStyle-greenTextOnline {
	color: rgb(160 124 183);
}
.ModalStyle-rootHover .ChangeOwnerDialogComponentStyle-container {
	backdrop-filter: blur(3px) !important;
    border-radius: 0px;
    background: transparent;
    text-decoration: none;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid rgb(160 124 183);
}
.ModalStyle-rootHover .ChangeOwnerDialogComponentStyle-container:before {
 content: "";
  position: absolute;
  background: linear-gradient(120deg, transparent, rgba(146, 148, 248, 0.4), transparent);
  transition: all 650ms;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

.ModalStyle-rootHover .ChangeOwnerDialogComponentStyle-container:after {
z-index: -1;
    content: '';
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    background: transparent;
}



.root .BattleHudFpsComponentStyle-container span {
	color: rgb(160 124 183) !important;
}`;
    document.head.appendChild(style);

    (() => {
        var tankResistances = [{
                name: "Броненосец",
                shitPicture: "https://tankionline.com/play/static/images/crit_resistance.7fb68893.svg",
                picture: "https://tankionline.com/play/static/images/resistances/crit_resistance.3f4d1cc2.svg"
            },
            {
                name: "Огнемёт",
                shitPicture: "https://tankionline.com/play/static/images/firebird_resistance.785a9d6b.svg",
                picture: "https://tankionline.com/play/static/images/resistances/firebird_resistance.00ac2221.svg"
            },
            {
                name: "Фриз",
                shitPicture: "https://tankionline.com/play/static/images/freeze_resistance.33bdf642.svg",
                picture: "https://tankionline.com/play/static/images/resistances/freeze_resistance.d26eb338.svg"
            },
            {
                name: "Изида",
                shitPicture: "https://tankionline.com/play/static/images/isis_resistance.30a69ffc.svg",
                picture: "https://tankionline.com/play/static/images/resistances/isis_resistance.5b05887a.svg"
            },
            {
                name: "Тесла",
                shitPicture: "https://tankionline.com/play/static/images/tesla_resistance.3e686c8e.svg",
                picture: "https://tankionline.com/play/static/images/resistances/tesla_resistance.663d3597.svg"
            },
            {
                name: "Молот",
                shitPicture: "https://tankionline.com/play/static/images/hammer_resistance.6c549d29.svg",
                picture: "https://tankionline.com/play/static/images/resistances/hammer_resistance.28e73097.svg"
            },
            {
                name: "Твинс",
                shitPicture: "https://tankionline.com/play/static/images/twins_resistance.ad189f61.svg",
                picture: "https://tankionline.com/play/static/images/resistances/twins_resistance.fbbc4d72.svg"
            },
            {
                name: "Рикошет",
                shitPicture: "https://tankionline.com/play/static/images/ricochet_resistance.8247beaa.svg",
                picture: "https://tankionline.com/play/static/images/resistances/ricochet_resistance.69c6c7ee.svg"
            },
            {
                name: "Смоки",
                shitPicture: "https://tankionline.com/play/static/images/smoky_resistance.845afc14.svg",
                picture: "https://tankionline.com/play/static/images/resistances/smoky_resistance.c4c202ca.svg"
            },
            {
                name: "Страйкер",
                shitPicture: "https://tankionline.com/play/static/images/rocket_launcher_resistance.b7dfd64f.svg",
                picture: "https://tankionline.com/play/static/images/resistances/rocket_launcher_resistance.5772cbaa.svg"
            },
            {
                name: "Вулкан",
                shitPicture: "https://tankionline.com/play/static/images/vulcan_resistance.824f6f0e.svg",
                picture: "https://tankionline.com/play/static/images/resistances/vulcan_resistance.9aebf267.svg"
            },
            {
                name: "Гром",
                shitPicture: "https://tankionline.com/play/static/images/thunder_resistance.6d7f4531.svg",
                picture: "https://tankionline.com/play/static/images/resistances/thunder_resistance.9dab2abf.svg"
            },
            {
                name: "Скорпион",
                shitPicture: "https://tankionline.com/play/static/images/scorpio_resistance.e8f1787f.svg",
                picture: "https://tankionline.com/play/static/images/resistances/scorpio_resistance.d40f8fbb.svg"
            },
            {
                name: "Рельса",
                shitPicture: "https://tankionline.com/play/static/images/railgun_resistance.636a554f.svg",
                picture: "https://tankionline.com/play/static/images/resistances/railgun_resistance.7577c7a1.svg"
            },
            {
                name: "Магнум",
                shitPicture: "https://tankionline.com/play/static/images/artillery_resistance.9b4cbc34.svg",
                picture: "https://tankionline.com/play/static/images/resistances/artillery_resistance.bd49fc96.svg"
            },
            {
                name: "Гаусс",
                shitPicture: "https://tankionline.com/play/static/images/gauss_resistance.bb8f409c.svg",
                picture: "https://tankionline.com/play/static/images/resistances/gauss_resistance.acf358ed.svg"
            },
            {
                name: "Шафт",
                shitPicture: "https://tankionline.com/play/static/images/shaft_resistance.0778fd3e.svg",
                picture: "https://tankionline.com/play/static/images/resistances/shaft_resistance.7e58bc19.svg"
            },
            {
                name: "Мины",
                shitPicture: "https://tankionline.com/play/static/images/mine_resistance.dd581c90.svg",
                picture: "https://tankionline.com/play/static/images/resistances/mine_resistance.0d0d3c98.svg"
            }
        ];

        new MutationObserver((mutations) => {
            mutations.forEach(({
                addedNodes,
                target
            }) => {
                if (addedNodes.length && ("tbody" === target.localName || target.className.includes("BattleComponentStyle-canvasContainer"))) {
                    const user = document.querySelector(".UserInfoContainerStyle-textDecoration")?.textContent?.split(" ").pop();

                    target.querySelectorAll(".Common-maskImage").forEach((element) => {
                        const maskImage = window.getComputedStyle(element).getPropertyValue("-webkit-mask-image")?.split('"')?.[1];
                        const resistance = tankResistances.find(({
                            shitPicture
                        }) => maskImage === shitPicture);

                        if (resistance) {
                            element.style.cssText = `
              -webkit-mask-image: none;
              background: url(${resistance.picture}) center center / 1em 1em no-repeat;
              width: 1em;
              height: 1em;
            `;
                        }
                    });
                }
            });
        }).observe(document, {
            childList: true,
            subtree: true
        });
    })();
})();