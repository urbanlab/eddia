# EDDIA #

# Principe #

Les Espaces de Discussion (EDD) sont, au sein d'une entreprise, des rencontres entre un médiateur et des employés, permettant à ces derniers de faire part de leur situation au travail et d'exprimer leur avis sur le fonctionnement de l'entreprise. Les informations récoltées lors des EDD parviennent aux instances dirigeantes des entreprises, ce qui leur permet de prendre en compte le point de vue de leurs salariés.

L'idée de ce dispositif est de favoriser le dialogue au cours des EDD en permettant de dégager et hiérarchiser efficacement les idées-clés de la conversation.

# Fonctionnement #

Le dispositif mis en oeuvre est une table tactile capable d'écouter une conversation grâce à un micro et d'en extraire, par catégorie prédéterminée, les termes-clés. Dans sa version finale, il fonctionnera en trois temps:

1. *Temps de la discussion*: le dispositif écoute la conversation, relève les termes-clés et les affiche sur une table tactile. En cas d'oubli, le médiateur peut rajouter des termes-clés "manuellement". Pour faciliter la conversation, toucher l'un des termes sur la table permet d'accéder à des ressources à son sujet.

2. *Temps de la hiérarchisation*: A la fin de la conversation, le groupe classe les termes-clés en trois niveaux d'importance en les faisant glisser sur la table.

3. *Temps de la restitution*: Le logiciel utilisé constitue automatiquement un compte-rendu de la réunion à l'aide des résultats de la hiérarchisation. Ce compte-rendu est ensuite modifié et validé par le médiateur, et envoyé aux instances dirigeantes de l'entreprise.

Pour l'instant, EddIA permet de réaliser le premier temps de ce processus.

# Architecture #

## Architecture générale ##

EddIA se compose de:

- D'un serveur web hébergé par une machine Linux (machine virtuelle tournant sur le réseau de l'UrbanLab).
- Une table tactile de grande dimension, permettant l'interaction employé-manager.
- D'un microphone pour l'acquisition de la conversation.

En termes d'architecture logiciel, il s'agit d'une application Web sous NodeJS, et dont la tablette est le client. La reconnaissance des termes-clés de la conversation se fait grâce à la combinaison de l'API Chrome Web Speech API et d'une base de données de termes-clés prédéfinis.

## Structure du code ##

Il s'agit d'une application Web classique, fonctionnant sous le framework Express de nodeJS et utilisant la technologie des sockets:
* Le répertoire principal contient le code du serveur, *app.js*, et le fichier de gestion des modules *package.json*
* Le répertoire **views** contient le code de la page HTML, *app-html.ejs*
* Le répertoire **public** comporte les ressources statiques utilisées par la page côté client (images, sons, polices de caractères), sa feuille de style (*public/css/style-hlml.css*), son code Javascript (*public/js/app-html.js*) et les librairies  Javascript qu'elle utilise (le reste du contenu de *public/js*).
* Le répertoire **certs** contient les certificats SSH (invalides) utilisés pour faire fonctionner l'application de https (nécessaire pour utiliser Chrome WebSpeech API).
* Le répertoire **datas** comporte les bases de données de  mots utilisées par l'application. *datas/structs* comporte les données de chaque salon de discussion ouvert (chaque conversation en crée un, auquel on peut revenir en entrant l'URL `https://IP_du_serveur:3010/sujet_de_discussion/numéro_du_salon`. *datas/topics* contient les données associés à chaque sujet de discussion (créer un sous-répertoire <=> créer un nouveau sujet de discussion, mettre le titre en majuscules) dans les fichiers *datas/topics/TOPIC/words.json* (liste des mots à reconnaitre, classés par intérêt) et *datas/topics/TOPIC/words.json* (liste des contenus associés aux différents couples (intérêt, mot)).

# Guide d'utilisation #

## Démarrage ##

Pour installer l'application **(machine Ubuntu 16.04)** cloner ce répertoire, y ouvrir une console et taper `npm install`.

Pour lancer l'application, il suffit de lancer le serveur puis d'ouvrir Chrome à l'adresse `https://IP_du_serveur:3010` (un exemple de scripts de lancement et d'arrêt automatisés est disponible dans le répertoire **scripts**). Alors:

# Utilisation #
La page de l'application Eddia relève et affiche les mots-clés, classés par catégorie appelées "intérêts", sous forme de bulles. De base, seuls les intérêts s'affichent, en appuyant sur un intérêt on affiche les mots qu'il contient et en appuyant sur un mot, on affiche un éventuel contenu associé.

1. Pour choisir un sujet de conversation, toucher le titre de la conversation au centre de la page, puis toucher l'un des sujets de conversation qui apparaissent en bas de la page.
2. Pour lancer/interrompre l'écoute de la conversation par la table, toucher l'icône en forme de micro.
3. Pour ajouter un mot à la conversation "à la main", toucher le bouton '+', et, entre les deux bips sonores, prononcer "Dans le domaine *intérêt correspondant au mot* ajoute *mot*". Le mot peut être constitué de plusieurs sous-mots.
4. Pour supprimer un mot, le faire glisser au niveau d'un coin de la page jusqu'à qu'un liseré rouge apparaisse puis le déposer.
5. Pour faire tourner la page, toucher l'un de ses bords.
6. Pour recharger la page, toucher son coin en haut à droite.
7. Pour revenir à une discussion plus tard, relever l'URL de la page. La recharger sus Chrome uniquement.

### Problèmes éventuels ###
* La reconnaissance vocale ne fonctionne plus:
    * Dans sa version actuelle, Eddia utilise l'API Chrome Web Speech, qui a l'avantage de fonctionner localement sur le navigateur mais ne fonctionne que sur Google Chrome et est limitée à des écoutes de 60 secondes. Si cette limite est dépassée, il faut attendre 1 minute ou bien recharger la page.
* Une bulle reste coincée au bord de la page:
    * Recharger la page

# Modifications à apporter #

* Migrer vers une autre API de reconnaissance vocale, la solution mise en oeuvre actuellement ne convenant pas à l'utilisation d'Eddia.
* Documenter, réorganiser et "nettoyer" le code.
* Supprimer le bug qui rend une bulle au bord de la page non-interactive.
