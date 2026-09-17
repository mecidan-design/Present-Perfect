# -*- coding: utf-8 -*-
"""Los 7 mini tests, copiados de los .docx del profesor.

Tabla: (clave del verbo, [columnas dadas]) y opcionalmente el texto tal cual
aparece en la hoja si difiere de la forma estandar.
Oraciones: (antes, despues, verbo, aux, why, tip)
"""

# ---- avisos que tambien van dentro del HTML generado ----
AVISOS = {
 3: u"MINI TEST 3, VERSION 2: en la hoja la palabra FLY esta en la columna\n"
    u"   'Simple past'. FLY es el infinitivo (fly - flew - flown), asi que en\n"
    u"   pantalla se muestra en la columna de infinitivo. Si no, el item no\n"
    u"   tendria respuesta posible.",
 4: u"MINI TEST 4: la hoja usa LAY en dos lugares distintos. En la version 1\n"
    u"   esta en la columna 'Simple past' (lie - lay - lain, correcto) y en la\n"
    u"   version 2 en la columna 'Infinitive'. Como infinitivo, lay - laid - laid\n"
    u"   es otro verbo. El corrector ACEPTA LAS DOS lecturas.\n"
    u"   Ademas, en la version 2 la hoja escribe 'Know' en minusculas: se\n"
    u"   respeta tal cual, no se corrige.",
 5: u"MINI TEST 5, VERSION 1: la hoja tiene una ultima fila completamente\n"
    u"   vacia (sin ninguna palabra dada). No se puede completar, asi que no\n"
    u"   esta en pantalla. Por el contenido de la version 2, probablemente\n"
    u"   era SIT - SAT - SAT.",
}

def S(before, after, verb, aux, why, tip):
    return dict(before=before, after=after, verb=verb, aux=aux, why=why, tip=tip)

TESTS = []

# ============================== MINI TEST 1 ==============================
TESTS.append(dict(
  num=1, name=u"The First Twelve",
  sub=u"Verbs from BE to CHOOSE. Two versions, exactly the ones on the paper.",
  v1_table=[("be",[0]),("beat",[2]),("become",[0]),("begin",[2]),("bite",[1]),
            ("blow",[1]),("break",[0]),("bring",[1]),("build",[0]),("buy",[2]),
            ("catch",[0]),("choose",[1])],
  v1_free=dict(pool=["BE","BEAT","BECOME","BEGIN","BITE","BLOW","BREAK","BRING","BUILD","BUY","CATCH","CHOOSE"],
               model=u"I have broken my glasses twice this year."),
  v2_table=[("be",[0]),("beat",[1]),("become",[2]),("begin",[0]),("bite",[0]),
            ("blow",[2]),("break",[1]),("bring",[0]),("build",[1]),("buy",[0]),
            ("catch",[1]),("choose",[2])],
  v2_free=dict(pool=["BE","BEAT","BECOME","BEGIN","BITE","BLOW","BREAK","BRING","BUILD","BUY","CATCH","CHOOSE"],
               model=u"My brother has caught a very big fish."),
))

# ============================== MINI TEST 2 ==============================
TESTS.append(dict(
  num=2, name=u"From COME to FEEL",
  sub=u"A short table and five sentences. The table asks for the infinitive, the simple past or the past participle.",
  v1_table=[("come",[1]),("cost",[0]),("do",[1]),("eat",[2]),("feel",[0])],
  v1_items=[
    S(u"My dad", u"for 4 hours! He is so tired!", "drive", "has",
      u"My dad is one person, so we use has, and drive is irregular: drive - drove - driven.",
      u"He is tired right now, and that is why this is the present perfect and not the past simple."),
    S(u"They", u"from the stairs and now they can't walk.", "fall", "have",
      u"They is more than one person, so we use have, and fall is irregular: fall - fell - fallen.",
      u"fell is the past simple. After have you always need fallen."),
    S(u"My sister", u"all the orange juice!", "drink", "has",
      u"My sister is one person, so we use has, and drink is irregular: drink - drank - drunk.",
      u"drank is the past simple. After has the word is drunk."),
    S(u"All the students", u"beautiful pictures.", "draw", "have",
      u"All the students is plural, so we use have, and draw is irregular: draw - drew - drawn.",
      u"drawed does not exist. The past participle is drawn."),
    S(u"Mati", u"his finger! We have to go to the doctor!", "cut", "has",
      u"Mati is one person, so we use has, and cut never changes: cut - cut - cut.",
      u"The word looks like the infinitive. The has in front is what makes it the present perfect."),
  ],
  v2_table=[("cost",[1]),("cut",[2]),("draw",[1]),("fall",[0]),("drive",[1])],
  v2_items=[
    S(u"My sister", u"all my sweets and now she has a stomach ache.", "eat", "has",
      u"My sister is one person, so we use has, and eat is irregular: eat - ate - eaten.",
      u"ate is the past simple. have ate is always wrong."),
    S(u"The students", u"all their homework quickly and the teacher is very happy.", "do", "have",
      u"The students is plural, so we use have, and do is irregular: do - did - done.",
      u"did can never follow have. The word you need is done."),
    S(u"Peter", u"three glasses of water this afternoon. He has to go to the toilet!", "drink", "has",
      u"Peter is one person, so we use has, and drink is irregular: drink - drank - drunk.",
      u"this afternoon is not finished yet, so the present perfect fits perfectly."),
    S(u"I", u"back to school after a long holiday.", "come", "have",
      u"I takes have, and come is irregular: come - came - come.",
      u"The first and the third form of come are the same word."),
    S(u"Unfortunately, I", u"very sick all day today!", "feel", "have",
      u"I takes have, and feel is irregular: feel - felt - felt.",
      u"today is not over yet, so we use the present perfect."),
  ],
))

# ============================== MINI TEST 3 ==============================
TESTS.append(dict(
  num=3, name=u"From GIVE to HIDE",
  sub=u"Seven verbs in the table and five sentences in the present perfect.",
  v1_table=[("give",[0]),("forget",[0]),("get",[1]),("fight",[0]),("hang",[2]),
            ("have",[1]),("hear",[2])],
  v1_items=[
    S(u"Luckily, I", u"my phone. I thought I lost it!", "find", "have",
      u"I takes have, and find is irregular: find - found - found.",
      u"The second and the third form of find are the same word."),
    S(u"My little sister", u"so much in these last few months. She is very tall.", "grow", "has",
      u"My little sister is one person, so we use has, and grow is irregular: grow - grew - grown.",
      u"these last few months are not finished, so the present perfect is the right tense."),
    S(u"I", u"my friend's folder. It's a joke!", "hide", "have",
      u"I takes have, and hide is irregular: hide - hid - hidden.",
      u"Two d in hidden. With one d it is the past simple."),
    S(u"The plane", u"for ten hours. It's going to arrive at the airport soon.", "fly", "has",
      u"The plane is one thing, so we use has, and fly is irregular: fly - flew - flown.",
      u"The plane is still in the air, and that is why we use the present perfect."),
    S(u"My dad isn't at home, he", u"shopping.", "go", "has",
      u"he is one person, so we use has, and go is irregular: go - went - gone.",
      u"has gone means he is not here now. went can never follow has."),
  ],
  v2_table=[("find",[0]),("fly",[0]),("get",[2]),("give",[0]),("go",[1]),
            ("grow",[2]),("hide",[0])],
  v2_items=[
    S(u"I", u"with my best friend recently. I'm very sad.", "fight", "have",
      u"I takes have, and fight is irregular: fight - fought - fought.",
      u"recently is a present perfect word: it does not say exactly when."),
    S(u"Peter and tom", u"sushi for the first time last night. It was amazing!", "have", "have",
      u"Peter and tom are two people, so we use have, and the verb have is irregular: have - had - had.",
      u"In have had, the first have is the helper and had is the past participle."),
    S(u"The children", u"a wonderful story during the storytelling class today.", "hear", "have",
      u"The children is plural, so we use have, and hear is irregular: hear - heard - heard.",
      u"today is not finished, so the present perfect works here."),
    S(u"Oh no! The teacher", u"his marker. Have you got one?", "forget", "has",
      u"The teacher is one person, so we use has, and forget is irregular: forget - forgot - forgotten.",
      u"Two t in forgotten."),
    S(u"My mum", u"her coat behind the door before going in.", "hang", "has",
      u"My mum is one person, so we use has, and hang is irregular: hang - hung - hung.",
      u"hung is the word for coats and pictures."),
  ],
))

# ============================== MINI TEST 4 ==============================
TESTS.append(dict(
  num=4, name=u"From HIT to PUT",
  sub=u"Ten verbs in the table. Many of them never change, so look at the helper in front.",
  v1_table=[("hit",[1]),("hold",[0]),("hurt",[1]),("lend",[1]),("let",[0]),
            ("lie",[1]),("light",[2]),("make",[0]),("mean",[2]),("put",[0])],
  v1_items=[
    S(u"Ouch! I think I", u"my knee.", "hurt", "have",
      u"I takes have, and hurt never changes: hurt - hurt - hurt.",
      u"The word does not change, so the have in front is the only sign of the present perfect."),
    S(u"She", u"her husband for a long time. They met at university.", "know", "has",
      u"She is one person, so we use has, and know is irregular: know - knew - known.",
      u"for a long time goes hand in hand with the present perfect."),
    S(u"Where is my student's book? I think I", u"it.", "lose", "have",
      u"I takes have, and lose is irregular: lose - lost - lost.",
      u"lose has one o. loose, with two, is a different word."),
    S(u"Mary", u"all her promises so far.", "keep", "has",
      u"Mary is one person, so we use has, and keep is irregular: keep - kept - kept.",
      u"so far means up to now, and that is present perfect territory."),
    S(u"My computer isn't working, so I", u"for a new one at the shop.", "pay", "have",
      u"I takes have, and pay is irregular: pay - paid - paid.",
      u"payed with a y does not exist."),
  ],
  v2_table=[("hit",[0]),("hurt",[0]),("keep",[1]),("know",[0],u"Know"),("lend",[2]),
            ("lay",[0]),("light",[1]),("lose",[1]),("mean",[0]),("pay",[0,2])],
  v2_items=[
    S(u"It's my birthday tomorrow, so my mum", u"a wonderful cake for me.", "make", "has",
      u"My mum is one person, so we use has, and make is irregular: make - made - made.",
      u"The cake is ready now, so the present perfect is the right tense."),
    S(u"I can't find my student's book! Oh right, I", u"it in my locker before the break.", "put", "have",
      u"I takes have, and put never changes: put - put - put.",
      u"putted does not exist."),
    S(u"“Where is dad?” “He's not at home, I think he", u"to go to the park”", "leave", "has",
      u"he is one person, so we use has, and leave is irregular: leave - left - left.",
      u"has left means he is not here any more."),
    S(u"We all passed the test, so the teacher", u"us play ping-pong.", "let", "has",
      u"The teacher is one person, so we use has, and let never changes: let - let - let.",
      u"letted does not exist."),
    S(u"The band", u"all the concerts at River Plate's stadium since last year.", "hold", "has",
      u"The band is one group, so we use has, and hold is irregular: hold - held - held.",
      u"since last year is a present perfect signal: it started in the past and it is still true."),
  ],
))

# ============================== MINI TEST 5 ==============================
TESTS.append(dict(
  num=5, name=u"From RIDE to SIT",
  sub=u"Nine verbs in the first table, ten in the second one, and five sentences in each version.",
  v1_table=[("ride",[1]),("rise",[0]),("say",[0]),("see",[2]),("send",[1]),
            ("shine",[1]),("shoot",[2]),("show",[0]),("shut",[1])],
  v1_items=[
    S(u"We", u"a great book in our English class: Gangsta Granny.", "read", "have",
      u"We is plural, so we use have, and read is written the same three times: read - read - read.",
      u"You write the same word, but here it sounds like the colour red."),
    S(u"Tini", u"a new song at her concert recently and her fans were surprised.", "sing", "has",
      u"Tini is one person, so we use has, and sing is irregular: sing - sang - sung.",
      u"sang is the past simple. After has you need sung."),
    S(u"He", u"his house to buy a new one.", "sell", "has",
      u"He is one person, so we use has, and sell is irregular: sell - sold - sold.",
      u"sell and tell are the same family: sold and told."),
    S(u"The athletes", u"a 5km marathon.", "run", "have",
      u"The athletes is plural, so we use have, and run is irregular: run - ran - run.",
      u"The first and the third form of run are the same word."),
    S(u"Ok! You can go to the break, the bell", u".", "ring", "has",
      u"The bell is one thing, so we use has, and ring is irregular: ring - rang - rung.",
      u"rang is the past simple. After has the word is rung."),
  ],
  v2_table=[("read",[2]),("ring",[0]),("rise",[1]),("run",[0]),("sell",[1]),
            ("shine",[0]),("shoot",[1]),("shut",[0]),("sing",[1]),("sit",[2])],
  v2_items=[
    S(u"The secretary said that she", u"me an e-mail, but I didn't receive it.", "send", "has",
      u"she is one person, so we use has, and send is irregular: send - sent - sent.",
      u"send, lend and spend all end in -t in the past."),
    S(u"I", u"a horse recently. It was amazing!", "ride", "have",
      u"I takes have, and ride is irregular: ride - rode - ridden.",
      u"Two d in ridden. rode is the past simple."),
    S(u"I think I", u"you at the shopping centre the other day. Were you there?", "see", "have",
      u"I takes have, and see is irregular: see - saw - seen.",
      u"saw is the past simple. After have you need seen."),
    S(u"You", u"me the picture that you drew. It's fantastic, I love it!", "show", "have",
      u"You takes have, and show is only half irregular: show - showed - shown.",
      u"showed is the past simple, but the past participle is shown."),
    S(u"Oh no! The teacher", u"that we are having a test next week.", "say", "has",
      u"The teacher is one person, so we use has, and say is irregular: say - said - said.",
      u"It is written said, but it sounds like sed."),
  ],
))

# ============================== MINI TEST 6 ==============================
TESTS.append(dict(
  num=6, name=u"From SPEAK to WRITE",
  sub=u"The last stretch of the list: thirteen verbs in the first table and twelve in the second one.",
  v1_table=[("speak",[0]),("spend",[2]),("stand",[1]),("steal",[0]),("swim",[0]),
            ("take",[1]),("teach",[2]),("tear",[1]),("tell",[0]),("think",[1]),
            ("throw",[2]),("understand",[0]),("win",[2])],
  v1_items=[
    S(u"I", u"at a five-star hotel recently when I was on holiday. It was so comfortable.", "sleep", "have",
      u"I takes have, and sleep is irregular: sleep - slept - slept.",
      u"sleep, keep and feel all end in -t in the past."),
    S(u"The famous author", u"a new book.", "write", "has",
      u"The famous author is one person, so we use has, and write is irregular: write - wrote - written.",
      u"Two t in written. wrote is the past simple."),
    S(u"Somebody", u"my wallet. I can't find it!", "steal", "has",
      u"Somebody is one person, so we use has, and steal is irregular: steal - stole - stolen.",
      u"The wallet is missing right now, and that is why we use the present perfect."),
    S(u"Jenny", u"a beautiful dress to the party.", "wear", "has",
      u"Jenny is one person, so we use has, and wear is irregular: wear - wore - worn.",
      u"wore is the past simple. After has the word is worn."),
    S(u"I am very tired today! I", u"up at 5am.", "wake", "have",
      u"I takes have, and wake is irregular: wake - woke - woken.",
      u"woke is the past simple. After have you need woken."),
  ],
  v2_table=[("sleep",[0]),("speak",[2]),("spend",[0]),("stand",[2]),("steal",[1]),
            ("tear",[2]),("tell",[1]),("think",[0]),("understand",[2]),("wake",[0]),
            ("wear",[1]),("write",[1])],
  v2_items=[
    S(u"That fantastic actress", u"an Oscar. Wow!", "win", "has",
      u"That fantastic actress is one person, so we use has, and win is irregular: win - won - won.",
      u"won sounds exactly like the number one."),
    S(u"We", u"in the ocean in the summer.", "swim", "have",
      u"We is plural, so we use have, and swim is irregular: swim - swam - swum.",
      u"swam is the past simple. After have the word is swum."),
    S(u"Our English teacher", u"a new topic. It's difficult!", "teach", "has",
      u"Our English teacher is one person, so we use has, and teach is irregular: teach - taught - taught.",
      u"catch and teach are a pair: caught and taught."),
    S(u"The basketball player", u"the ball and scored!", "throw", "has",
      u"The basketball player is one person, so we use has, and throw is irregular: throw - threw - thrown.",
      u"threw is the past simple. After has you need thrown."),
    S(u"My dad", u"me to school today's morning.", "take", "has",
      u"My dad is one person, so we use has, and take is irregular: take - took - taken.",
      u"took is the past simple. After has the word is taken."),
  ],
))

# ============================== MINI TEST 7 ==============================
TESTS.append(dict(
  num=7, name=u"All the Verbs",
  sub=u"The final test. Verbs from the whole list, and then five sentences of your own.",
  v1_table=[("be",[0]),("begin",[2]),("come",[1]),("catch",[0]),("drive",[2]),
            ("forget",[0]),("hurt",[1]),("lie",[2]),("put",[0]),("say",[1]),
            ("speak",[0]),("teach",[0]),("throw",[1])],
  v1_free=dict(pool=["FIGHT","GIVE","HEAR","MAKE","EAT","RIDE","SEND","CHOOSE"],
               model=u"My grandmother has made the best cake in the world."),
  v2_table=[("be",[0]),("bring",[2]),("drink",[1]),("hear",[0]),("choose",[2]),
            ("find",[0]),("know",[1]),("lie",[2]),("hit",[0]),("see",[1]),
            ("sleep",[0]),("think",[0]),("understand",[1])],
  v2_free=dict(pool=["WEAR","FORGET","HURT","MEET","DO","RUN","SING","CATCH"],
               model=u"I have forgotten my homework at home again."),
))
