Convention de nommage

[model(s)]-[operation]-[description]

models:
- si c'est une query: prendre le modèle sur lequel ont fait l'aggregate/find
- si c'est une mutation: prendre tous les modèles qui subissent un update

operation:
- si c'est une query: get
- si c'est une mutation: set ou create

description:
Décrit généralement le type de résultats renvoyés et si nécessaire les arguments

