<template>
    <div class="about-oauth">

    <div class="box">
    <div class="header">
     <img class="" src="/auth/header_login.svg"/>
    </div>
        <div class="content">

        <h1>Custeed</h1>
        <h2>Qu'est ce que Custeed</h2>

        Custeed propose aux professionnels de la mobilité
        de gérer depuis une interface web plusieurs problématiques liées à leur métier:
        <ul>
            <li>Gestion des avis clients</li>
            <li>Traitement des mécontents</li>
            <li>Traitement des projets d'achat</li>
            <li>campagne marketing automatique</li>
            <li>Eréputation</li>
            </ul>

        <h2>Se connecter avec Google.</h2>
        <h3>Utilisation de vos données personnelles</h3>
            Custeed souhaite accèdeer à vos données Google pour vous aider à gérer automatiquement votre e-reputation.<br/>
            En partageant vos données avec Custeed, vous pourrez gérer directement depuis nos interface: la création, modification et suppression de vos fiches d'établissements.
        <br/>


        <h3>Partage sécurisé</h3>
            Découvrir comment Google vous aide à
         <a href="https://support.google.com/accounts/answer/10130420?hl=fr">
            partager vos données de façon sécurisée
        </a>
        <h3>Pourquoi donner accès à votre compte Google améliorera votre expérience ?</h3>
            Custeed téléchargera automatiquement tous les nouveaux avis déposés sur vos établissements et vous permettra d'y répondre manuellement ou automatiquement.
        <h3>Politique de confidentialité</h3>
            <a href="/privacy.pdf">Télécharger le document</a>
    </div>
    </div>
    </div>
</template>

<script>
export default {
    mounted () {
    }
}
</script>
<style>
.about-oauth {
    background: url("/auth/bg_login.jpg") bottom fixed no-repeat;
    background-size: cover;
    height: 100vh;

}
.header {
    position: relative;
    margin-bottom: -4px;
    height: 100%;
}
.box {
    width: 500px;
    margin: auto;
}
.content {background: white;
    width: 420px;
    padding: 10px;
    font-size: 0.8rem;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding-bottom: 15px;
}

</style>