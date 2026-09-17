# -*- coding: utf-8 -*-
"""Oraciones para completar con ever / never / for / since.

>>> ESTO NO SALE DE LAS HOJAS DEL PROFESOR <<<
Los mini tests 1 y 7 piden "choose five verbs and write five COMPLETE
sentences". El profesor cambio esa consigna: quiere que se completen
oraciones, con la logica del ejercicio 2 de la pagina 159, y que el foco
sean los cuatro marcadores del present perfect: ever, never, for y since.
Estas veinte oraciones estan escritas para eso. Los VERBOS si salen del
recuadro de cada mini test, sin agregar ninguno nuevo.

Formato de cada item:
  form   -> la etiqueta que ve el alumno: affirmative / negative / question
  neg    -> como se niega: "never" (has never done) o "not" (hasn't done)
  aux    -> has o have, segun el sujeto
  marker -> cual de los cuatro marcadores entrena la oracion
  Para afirmativa y negativa: before + [hueco] + after
  Para pregunta: [hueco auxiliar] + mid + [hueco participio] + after
"""

AFF, NEG, QUE = "affirmative", "negative", "question"

MARKER_ITEMS = {

# ================= Gate I, version 1 =================
(1,1): [
 dict(form=AFF, neg=None, aux="have", verb="be", marker="for",
      before=u"I", after=u"in this school for six years.",
      why=u"I takes have, and for six years measures how long something has lasted, which is exactly what the present perfect is for: have been.",
      tip=u"for answers the question 'how long?': for six years, for two months, for ten minutes."),
 dict(form=NEG, neg="never", aux="has", verb="bite", marker="never",
      before=u"A dog", after=u"me.",
      why=u"A dog is one animal, so it takes has, and never goes between has and the past participle: has never bitten.",
      tip=u"never already makes the sentence negative, so you never put not next to it."),
 dict(form=QUE, neg=None, aux="have", verb="build", marker="ever",
      mid=u" you ever ", after=u"a sandcastle?",
      why=u"The question asks about your whole life, so it starts with Have and ever goes after you. build is irregular: build - built - built.",
      tip=u"ever only lives in questions. In a statement you would use never instead."),
 dict(form=AFF, neg=None, aux="have", verb="bring", marker="since",
      before=u"We", after=u"our lunch to school since March.",
      why=u"We takes have, and since March says the moment it started, so the verb goes in the present perfect: have brought.",
      tip=u"since points at when it started: since March, since Monday, since I was six."),
 dict(form=NEG, neg="not", aux="has", verb="buy", marker="since",
      before=u"My brother", after=u"a new bike since 2023.",
      why=u"My brother is one person, so it takes has, and this negative is built with n't: hasn't bought.",
      tip=u"There are two ways to say no: hasn't bought, or has never bought. Both are negative."),
],

# ================= Gate I, version 2 =================
(1,2): [
 dict(form=QUE, neg=None, aux="have", verb="break", marker="ever",
      mid=u" you ever ", after=u"a window?",
      why=u"Have opens the question because it asks about you, ever means 'in your life', and break is irregular: break - broke - broken.",
      tip=u"broke is the past simple. After Have you always need broken."),
 dict(form=AFF, neg=None, aux="has", verb="be", marker="for",
      before=u"Tom", after=u"in the same team for two years.",
      why=u"Tom is one person, so it takes has, and for two years measures how long he has been there: has been.",
      tip=u"for answers 'how long?' and since answers 'from when?'."),
 dict(form=NEG, neg="never", aux="has", verb="buy", marker="never",
      before=u"My grandmother", after=u"a ticket online.",
      why=u"My grandmother is one person, so has, and never sits between has and the past participle: has never bought.",
      tip=u"buy is irregular: buy - bought - bought, so buyed does not exist."),
 dict(form=QUE, neg=None, aux="has", verb="beat", marker="ever",
      mid=u" your team ever ", after=u"that school?",
      why=u"Your team is one group, so the question starts with Has, and beat is irregular: beat - beat - beaten.",
      tip=u"The first two forms of beat are the same word, but the third one adds -en."),
 dict(form=AFF, neg=None, aux="has", verb="blow", marker="since",
      before=u"The wind", after=u"hard since this morning.",
      why=u"The wind is one thing, so has, and since this morning says from when it started, so the verb is in the present perfect: has blown.",
      tip=u"blow is irregular: blow - blew - blown. blew is the past simple."),
],

# ================= Gate VII, version 1 =================
(7,1): [
 dict(form=NEG, neg="never", aux="have", verb="ride", marker="never",
      before=u"I", after=u"a horse.",
      why=u"I takes have, and never goes in the middle: have never ridden. ride is irregular: ride - rode - ridden.",
      tip=u"Two d in ridden. rode is the past simple."),
 dict(form=AFF, neg=None, aux="has", verb="make", marker="for",
      before=u"My aunt", after=u"cakes for twenty years.",
      why=u"My aunt is one person, so has, and for twenty years says how long she has been doing it: has made.",
      tip=u"make is irregular: make - made - made, so maked does not exist."),
 dict(form=QUE, neg=None, aux="have", verb="eat", marker="ever",
      mid=u" you ever ", after=u"sushi?",
      why=u"The question is about your life, so it starts with Have and ever comes after you. eat is irregular: eat - ate - eaten.",
      tip=u"ate is the past simple. Have you ever ate is always wrong."),
 dict(form=AFF, neg=None, aux="have", verb="send", marker="since",
      before=u"We", after=u"letters to our cousins since last summer.",
      why=u"We is plural, so have, and since last summer marks the moment it started: have sent.",
      tip=u"send is irregular: send - sent - sent, like lend and spend."),
 dict(form=NEG, neg="not", aux="have", verb="fight", marker="since",
      before=u"My brother and I", after=u"since Monday.",
      why=u"My brother and I is the same as we, so it takes have, and this negative uses n't: haven't fought.",
      tip=u"fight is irregular: fight - fought - fought, and it rhymes with bought."),
],

# ================= Gate VII, version 2 =================
(7,2): [
 dict(form=AFF, neg=None, aux="has", verb="wear", marker="since",
      before=u"Sara", after=u"glasses since she was six.",
      why=u"Sara is one person, so has, and since she was six says from when, so the verb goes in the present perfect: has worn.",
      tip=u"wear is irregular: wear - wore - worn. wore is the past simple."),
 dict(form=QUE, neg=None, aux="have", verb="meet", marker="ever",
      mid=u" you ever ", after=u"a famous person?",
      why=u"The question asks about your life, so Have goes first and ever comes after you. meet is irregular: meet - met - met.",
      tip=u"met has one e. meeted does not exist."),
 dict(form=NEG, neg="never", aux="has", verb="do", marker="never",
      before=u"My little sister", after=u"her homework alone.",
      why=u"My little sister is one person, so has, and never goes between has and the past participle: has never done.",
      tip=u"did can never follow has. The word you need is done."),
 dict(form=AFF, neg=None, aux="has", verb="run", marker="for",
      before=u"My cousin", after=u"every morning for a month.",
      why=u"My cousin is one person, so has, and for a month says how long: has run. run is irregular: run - ran - run.",
      tip=u"The first and the third form of run are the same word."),
 dict(form=NEG, neg="not", aux="have", verb="forget", marker="since",
      before=u"I", after=u"my keys since September.",
      why=u"I takes have, and this negative uses n't: haven't forgotten. forget is irregular: forget - forgot - forgotten.",
      tip=u"Two t in forgotten."),
],
}

NOTE_MARKERS = dict(
  title=u"ever, never, for and since",
  lines=[u"ever -> only in questions, and it means 'in your life': Have you ever built a sandcastle?",
         u"never -> in statements, between have/has and the past participle: A dog has never bitten me.",
         u"for -> how long something has lasted: for six years, for two months.",
         u"since -> the moment it started: since March, since 2023."],
  warning=u"A negative sentence can be built in two ways: with never, or with hasn't and haven't. Both say no.")
