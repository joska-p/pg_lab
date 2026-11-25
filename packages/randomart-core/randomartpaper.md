# Hash Visualization: a New Technique to improve Real-World Security

Dawn Song

Adrian Perrig

Dawn Songécs . cmu. edu

Computer Science Department Carnegie Mellon University 5000 Forbes Avenue Pittsburgh, PA 15213

Phone: (412) 268 3052

Fax: (412) 268 5576 5

## Abstract

Current security systems suffer from the fact that they

fail to account for human factors. This

ers two human limitations: First, people are slow and unreliable when comparing meaningless strings; and sec- ond, people have difficulties in remembering strong pass- words or PINs. We identify two applications where these human factors negatively affect security: Validation of root keys in public-key infrastructures, and user authen- tication. Qur approach to improve the security of these systems is to use hash visualization, a technique which replaces meaningless strings with structured images. We exatnine the requirements of such a system and propose the prototypical solution Random Art. We also show how to apply hash visualization to improve the real-world se- curity of root key validation and user authentication. Keywords: Human factors in security, hash visualiza- tion, user authentication through image recognition, root

key validation,

paper

## 1 Introduction

Although research in security has made tremendous progress over the past years, most security systems still suffer from the fact that they neglect human limitations in the real world. In this we analyze two hu paper, man limitations: difficulties people have with remember- ing strong passwords and personal identification num- bers (PIN)!, and second, with comparing meaningless strings?. These human factors negatively affect many

security systems, including the security of root key vali- dation and user authentication. The problem in root key validation is that people need to compare meaningless key fingerprints, which are strings of 32 hexadecimal digits. It is a known fact in psychology that people are slow and un- reliable at processing or memorizing meaningless strings [11. 8]. Also, in [2] Anderson et al. show that strings can be memorized better if people can associate meaning with thew, or if they look familiar. Similarly, the prob- lem in user authentication is that people have difficulties with choosing and memorizing strong passwords. If the passwords are too simple and have meanings, they are easy fo remember but vulnerable to attacks which use password cracker programs. If the passwords are more complex and random, they are difficult to remember and hence users have to write them down. In either case, the security of the systems is degraded.

These problems have long been considered as some of the fundamental weaknesses of security systews in the real world, we propose to use images to alleviate them. In the case of root key validation we use hash visualization to generate images from the strings, and the user can simply compare the images instead of the strings. This scheme is based on the fact that humans are very good at identifying geometrical shapes, patterns, and colors, and they can compare two images efficiently, as shown in [7, 15, 13]. In the case of user authentication, we replace the recall of a password or PIN with a recognition precise of a previously seen lage. Again, it has been shown that people are extremely efficient, at. recognizing previously seen images

Researchers have been trying to make cryptographic primitives stronger against attacks. The central point of this paper is to show that human factors have a large impact on the security of a real-world system. Our con-

tribution is to propose establish the necessar requirements, to

the new security primitive hash

i

, to

propose Random Art as a prototypical solution, and fi- nally, to show how to apply hash visualization to improve the security of root key validation and user authentica- tion. Since Random Art is just a prototype of the final solution, we hope with this paper to direct the interest of researchers in lage processing, security, and psychol-

ogy, cooperation between them in order to find better

and

solutions.

‘The is organized as follows. First we examine paper the requirements of the ideal hash visualization scheme in section 2. Lu section 3 we propose a possible solution to satisfy the requirements of the hash visualization. We then in section 4 two example applications about give

## 2.2 Requirements for hash visualization algorithms

Definition 1 A hash visualization

is a

function hy which has, properties:

-   1.  Image-generation: finite length, to an output tmage hy(v) of fived size. hy maps an © of arbitrary

-   2.  Ease of computation: given h and an input hy (x) 1s easy to compute.

In order for HVAs to be useful for secure applications, we illustrate a variety of desired properties for HVAs. A.

clude limitations the how to apply the hash visualization scheme to improve HVA that is used in a particular application will only security of systems. We discuss some problems and need to satisfy a subset of the We will give of this approach in section 5 and finally con- several examples of these applications and their usage of and list our future work in section 6.

the HVAs in the later section.

as a minimum, the following two

## 2 Requirements for Hash Visual- ization Algorithms

We first briefly review the definition and desired proper-

ties of usual hash functions. We then discuss the

proper-

should satisfy.

ties that hash visualization

## 2.1 Review of the requirements for tra- ditional hash functions

This review is based on the Handbook of Applied Cryp- tography [10].

- © A hash function is a function h which has, as a imum, the following two properties:

- Compression: h maps an input z of arbitrary fi- nite length, to an output h(x) of fixed bit length n.

-   2.  Base of computation: given h aud an input «, h(x) is easy to compute.

- Three most desired properties:

-   1.  Preimage resistance: for any pre-specified out- put y, it is computationally infeasible to find the fuput such that h(x) = y.

- ro 2nd-preimage resistance: given any input x, it is computationally infeasible to find an input such that h(z’) = h(x).

- wo Collision resistance: it is computationally in- feasible to find two distinct inputs z,2’ any which hash to the same output, h(x) = h(x’).

- A hash function is a hash function h with one-way two additional properties: pre-image resistance and 2nd-preimage resistance. A collision resistant hash Junction is a hash function h with the additional property of collision resistance.

## Near-one-way property

We define two images I; and Is to be near, denoted as I ~ I, if the two images are perceptually indistinguish- able.

-   1.  Near preimage resistance: for any pre-specified out- put image y, the input z such that it is computationally infeasible to find

- ro Near it’s computationally infeasible to find / such that ~ resistance: given any input z,

- Near collision resistance: it is computationally in- feasible to find two distinct inputs which any hash to the same output, ~ hy

1t is difficult to devise an algorithm which can judge automatically whether two images are near since that

comparing

depends general,

the

person

on

similarity-metric

find

we

I x I — R and a threshold 8 such that if

then the two images I; and I5 are not near. Finding a good function for is an active area of research in image retrieval and is not in the scope of this paper.

the images.

in

But

function

§

can

some

:

Is) > 3,

## Regularity property

Humans are good at identifying geometric objects (such as circles, rectangles, triangles, and lines), and shapes in general. We call images, which contain mostly recognizable shapes, regular images. If an image is not regular, i.e. does not contain identifiable objects or pat- terns, or is too chaotic (such as white noise). it is difficult

for humans to

We suggest two ways for testing the regularity of an image automatically.

-   1.  We can use a compression algorithm to compress the image. If the image is chaotic, such as white noise, the compression factor will be very small since al- most every pixel is random. Therefore we can show that an image is regular if the compression factor is above a certain threshold.

compare or recall it.

_(a) White noise_

_(b) Frequency Spectrum of white noise_

(c) Photograph

(d) Frequency spectrum

of photo

_Figure 1: White noise and photograph_

2. Now-regular images tend to have wide frequency spectra. Noisy images contain a high percentage of

the in high frequencies. Hence we can trans- energy

form an image to the Fourier domain and compute the magnitude spectrum. If the magnitude spectrum

regularity property, we could use compression or the fre- quency spectrum to detect images that are simplistic. For example, compressing an image which has all pixels set to a unique color, should result in a very short file. Also, the frequency spectrum of such a simplistic picture has all the in the lowest frequency components.

## 3 Random Art: A Possible Solu- tion

In this section, we propose Random Art as a possible solution for the hash visualization algorithm. Random Art was developed by Andrej Bauer, and is based on an idea of genetic art by Michael Withrock and John Mount. Originally Random Art was conceived for auto- matic generation of artistic images. A brief overview and demonstration of Random Art can be found at [4].

The basic idea is to use a binary string s as a seed for a random number generator. The randomness is used to construct a random expression which describes a func- tion generating the image—mapping each image pixel to a color value. The pixel coordinates range continuously from —1 to 1, in both x and y dimensions. The image res- olution defines the sampling rate of the continuous image. For example, to generate a 100 x 100 image, we sample the function at 10000 locations.

Random Art is an algorithm such that given a bit- string as it will generate a function F : —

which defines an image. The bit-string input is

used as a seed for the pseudo-random number generator, and the function is constructed by choosing rules from a

does not have too much in the high frequen- grammar depending on the value of the pseudo-random energy

< const, then the image is number generator. The function F maps each pixel (x,y)

‘To illustrate how to use energy in the magnitude spec- trum of the Fourier transform in order to decide regular- ity, we show in figure 1 white noise along with the Fourier

F(z.y) = produces a horizontal

the expression

gray grade, as shown in figure 2(a). A more complicated example is the following expression, which is shown in figure 2(b).

cies, regular.

## Minimum complexity property

Since the might be presented in many different image ways, i.e., printed in a newspaper, displayed on a color LCD display, or on a TV screen, the result of comparing two needs to be robust with respect to resolution and color changes: if two inputs and wo are ent, then the two outputs hy and should not be near with any resolution aud color configuration that could occur in the secure system; similarly. if two inputs 21 and ws are equal, then the outputs hz (x1) and hy (ws) should be near with any resolution and color configura- tion that could occur in the secure system.

An immediate implication of this property is that an image can not be too simplistic in shapes and patterns, or rely on subtle color differences. Just like for to the

to a RGB value (r,g,b) which is a triple of intensities for the red, green and blue values, respectively. For example,

‘The function F can also be seen as an expression tree, which is generated using a grammar G and a depth pa- rameter d, which specifies the minimum depth of the ex- pression tree that is generated. The grammar G defines the structure of the expression trees. It is a version of a context-free grammar, in which alternatives are labeled with probabilities. In addition, it is assumed that if the first alternative in the rule is followed repeatedly, a termi- nal clause is reached. This condition is needed when the algorithm needs to terminate the generation of a branch.

_Figure 2: Examples of images and corresponding expres- sions._

For illustration, consider the following simple grammar:

| y®)

| 23)

A z= (random number

_Figure 3: Random Art expression tree and the corre- sponding image_

algorithm RandomArt(G, i, d)

input: grammar G =

initial rule i

depth d

output: expression £

## begin

The numbers in supscripts are the probabilities with which alternatives are chosen by the algorithm. There are three rules in this simple grammar. The rule £ spec- ifies that an expression is a triple of compound expression The rule (says that every compound expression an atomic expression A with probability 1, or either the function add or mult applied to two compound expres sions, with probabilities § for each function. An atomic expression is either a constant, which is generated as end A a pseudorandom floating point number, or one of the co- ordinates « or y. All functions appearing in the Random

are scaled so that they map the interval

to the interval 1]. ‘L'his condition ensures that

all randomly generated expression trees are valid. For example, the scaling for the add function is achieved by defining add(z. y) = (z + y)/2.

The used in the Random Art implementation grammar is too large to be shown in this paper. Other functions included are: sin, cos, exp, square root, division, mix. ‘I'he function mix(a,b, c,d) is a function which blends ex- pressions ¢ and d depending ou the parameters a and b. We show an example of an expression tree of depth 5 in figure 3, along with the corresponding image. For the other in this paper, we used a depth of 12. images

Pseudo-code for the Random Art algorithm is shown in Figure 4. The function rnd() used in the algorithm returns a random number in the range [0, 1). The purpose

problems due to human factors

We demonstrate our concerns with a brief scenario.

expressions of the ‘while’ statement in step 5 is to make sure that the A user has just downloaded Netscape Navigator, which do not grow too fast with respect to depth d.

comes with a series of top-level root. keys. Unfortunately, Netscape has a misleading “verify” button in the window displaying the list of root keys, because “verify” only checks the integrity of the certificate and the dates. Netscape has no way of asserting that the shown key

really is the one

Art

- (1) Suppose =

- (2) If d < 0 then let a = a and goto step (4)

- (3) Let a be one of ax), picking a; with probability p;.

- (4) If a is a terminal rule let £ =a and go to step (6).

- (5) Suppose a = f(ri,,... where m is the arity of f. Let I = (6) Return E. While d > 0 and rd() < 0.5 dod: =d Tor each j = 1 m let Ej = RandomArt(G, ij, d — 1). En). — 1.

_Figure 4: Algorithm Random Art_

and user authentication.

## 4.1 Validation of root keys using images

Iu root key validation, a user verifies that a certain lo- cally stored root key really was issued by the correspond- ing certificate authority (CA). Since the user does not trust data downloaded from the network, the reference fingerprint needs to be passed over another channel, for example printed in a newspaper like the New York Times. Since the reference fingerprint is not in a digital format, the user needs to perform the comparison with the lo- cal root key fingerprint manually. This is where security

appear

## 4 Application

In this section, we show how to use hash visualization to improve the real-world security of root key validation

to that particular CA.

(a) Fi

(b)

_Figure 5: £4 and Fy visualized_

The ouly way to verify the key is to obtaiu the key fingerprint through another channel than the lnternet, for example from a newspaper. If we select the “edit” button in the root key window, we can see the following information for the “Verisign Class 1 Primary CA”:

Serial Number: Certificate Fingerprint:

56:F3:5C:81:AD:65:5C:

We call this fingerprint Fy. In the New York Times, we might find the following fingerprint for the same key:

Fingerprint: We refer to this fingerprint as Fo. A security-conscious user would go through the trouble of validating all 36 root keys that came with Netscape by comparing all the reference fingerprints to the local fingerprints,

while users will most likely not perform all the

many

necessary checks, or only compare the initial or final digits. To compute a public key which will match the § initial hexadecimal digits of the fingerprint, it only takes 231 = 2147483648 trials on average, which is feasible on today’s computers. Other users might not understand the importance of verifying the authenticity of the locally stored root key and avoid the validation. Hence, these human limitations greatly degrade the security of the systems. We propose to use Hash Visualization to generate a visual fingerprint from the binary fingerprint. ‘When using Random Art to generate the visual finger- prints of the two fingerprints Fy and listed above, we get the images shown in figure 5.

The visual fingerprints generated by Random Art are clearly easier to compare than the hexadecimal represen- tation. Another advantage of this system is that peo- ple can remember structured images and recognize them later. ‘Therefore, the user can possibly remember the image representing the fingerprint and perform the val- idation later. For example, Verisign could display their reference visual fingerprints in an advertisement on TV. At a later point in time, users can display the visual fin- gerprint on their trusted system and check whether they can recognize the image. Another application of the same idea is the validation of data or software downloaded from the Internet. The scenario is that a business traveler uses the computer that comes with his hotel room to read e-

mail. The e-mail could be a Java applet, down- program loaded from the Internet, such as the Pachyderm mail reader [14]. The user trusts the hotel computer, but how cau he or she kuow that the Pachyderm applet is correct (i.e. does not contain a ‘Trojan horse)? The obvious so-

lution would be to display a

of the Pachyderm

applet, which the user could compare with one written down on paper. But again, generating a visual checksum with Random Art would be more user-friendly, efficient, and the user would not need to keep a paper with the checksum.

## 4.2 User Authentication via Image Recognition

Even after of research in security, authentication years schemes based on passwords still have numerous short- comings [12, 9]. ln general, neither simple nor very plex passwords provide the desired security. Shorter, sim- pler passwords, which are easy to remember, are too eas- ily guessed with a password cracker program and user

On the other hand, if the password

the user cannot remember it and hence

needs to write it on a piece of paper. This again compro- mises security, since the user might forget, loose, or leave the paper in insecure places. Storing the password in a file might also present a security risk, depending on the computing environment.

Similarly, there is a trade-off related to the number of distinct passwords used. On one hand having many different passwords for different cases of authentication improves the security of a but on the other hand users tend to write down the infrequently used passwords, which are usually used for higher security purposes.

Another problem with passwords nowadays is that they are ubiquitous. With the general increase of security awareness, the number of occasions in which a password is required has dramatically increased. Logging onto a com- puter, accessing a protected spreadsheet, file, disabling a secure screen saver, and opening a personalized web site are just a few examples in which a password is re- quired. Since a user can only remember a limited number of passwords, he or she will either write them down, or use similar or even equal passwords for different purposes. Both options have a negative on security: writ- ing passwords down increases the chance of compromise, and reusing the same password in different places makes it only as secure as the weakest link.

Ou the Internet there are sites which offer personalized settings, such as my.yahoo.com. These sites require au- thentication with passwords but often do not use secure communication links. In this way passwords can be eas- ily sniffed off the network, not to mention that a security breach of a site like “My Yahoo!” would compromise a. very large number of systems, simply because people use the same passwords on many different systems. Similar considerations apply to PINs, which are frequently used as a method of authentication at ATMs.

The problems presented in this section are common. In 5

the first place, our motive is to draw attention to them, and to stress that even theoretically secure schemes might be insecure in practice because they ignore human fac- tors. Since people cannot remember strong passwords in general, we propose to replace the precise memorization and recall of the password or PIN with a recognition of

## Analysis and Discussion

Lu this section we evaluate Random Art using the require-

listed in section 2. We first evaluate the geometry

and regularity properties, followed by a discussion of how to assess its quality as a hash visualization algorithm.

a previously seen image, with the potential of alleviating Geometry and regularity requirements

some of the problems mentioned above.

Lustead of having a user memorize a password, he or she is presented with a small number of images, the image portfolio, which he or she must memorize for recognition. The portfolio is shown to the user in a safe environment where it can be ensured that no other person can see the images.

‘When the user wants to authenticate, he or she is pre- sented with a set of images. Some of the images are cho- sen from the user’s image portfolio and others are gener- ated randomly. The user must correctly identify all the images from the portfolio.

Suppose the portfolio contains 7 images and that for anthentication the system shows m > n images. This

gives (7) usually = rpm four digits combinations. long, which A gives credit 10,000 card pos- PIN code is sible combinations. To match this, we would have to use

and m = 20 which gives = 15504 combina-

A disadvantage of current ATM authentication schemes is that PIN codes can be observed from a dis- tance [3] by various ways of acquiring the typing sequence of the key pad. Since the images in our scheme are pre- sented in random order, an observer would gain no knowl- edge knowing which keys are typed, assuming that the images can only be seen by the person right in front of the ATM. A problem of displaying random images along with the ones in the portfolio is that a criminal could try to log in once for another person, remembering all the presented images. Later, the criminal would make a second attempt, picking the intersection of the presented images, which would correspond to the portfolio. Such attacks need to be taken into consideration during system design.

A combination of a traditional password scheme and image authentication system might give another oppor- tunity to improve the current problems. ‘The key observa- tion for this approach is that people remember the pass- word approzimately, but not exactly. The system could generate an image for the password which is typed in so far, and the user would then recognize the image corre- sponding to the correct password and pass that string to the password checking function. Another idea is to use a fixed database of real photographs, instead of Random Art. and letting users choose the pictures in their portfo- lio. This approach can take the advantage that people are extremely good at pointing out which images (or faces) they have seen [1, 6] previously.

For security of the hash visualization, Random Art the needs satisfy the near-one-way requirements listed in to

can achieve the hash function one-way

section 2.2. We

properties by hashing the input string with a crypto- graphically secure hash function, such as SHA-1 [10], to seed a cryptographically secure random number genera- tor, as Blum-Blum-Shub [5].* Hence, we can achieve such the pre-image-resistance property. But the difficulty is to

properties of the image

achieve collision-free, due to the

tions.

Similar to the difficulty of formally proving the hash vi- sualization properties, proving that all the images gener- ated by Random Art are regular, is hard. However, in practice we can limit the depth of the expression tree, which also limits the complexity of the image. Another factor limiting high complexity is that every function has the same domain and range, which is the interval [-1, 1]. Hence, there are no problems with functions approach- ing infinity, with a subsequent sin function, resulting in a very high frequency signal. In practice, we use 12 for the depth of the expression tree, which has so far resulted in regular images.

As we have shown earlier, we can use the Fourier spec- trum to detect irregular (or noisy) images. In figure 6 we show two Random Art images with their correspond-

Our

first

observation

that the

spectrum.

ing

is

resulting

They

Fourier

favorable.

spectra

are

r

the spectrum of a real image (as shown in figure 1(d)), as the energy is concentrated in the low-frequency com-

However, image 6(a) is much noisier than im-

age 6(c), as the energy spectrum has more energy in the high frequency components, which can be observed from the corresponding Fourier transforms.

Another issue is to ensure that the resulting images are not too simplistic. We have discussed two ways how to detect simplistic images. One method is compression, where we reject images which compress too well, and the other method is again the Fourier transform, where we can infer simplistic images if all the energy is in the lowest frequency components only.

To get an estimate of how many images in practice are regular or simplistic, we generated 100 images and inspected thew manually. 1t turned out that all images were regular and only 2 were simplistic. This shows that we can generate regular and minimally complex images by detecting and rejecting infrequent outliers

## Hash visualization requirements

_(a) Random Art image 1_

_(b) Frequency spectrum_

(d) Frequency spectrum

(c) Random Art image 2

2

_Figure 6: Random Art images with frequency spectrum_

generation. First, it is easy to see that many different trees generate identical images. As an example we men- 6 tion the commutative property of addition or multiplica- tion, where the image remains invariant when swapping sub-trees of those operators. In addition, certain con-

seeing duplicates after approximately v/N drawings. The name birthday paradox comes from the fact that we ex- pect with a 50% probability, to have two people with the

birthday as soon as we have more than 24 people.

We can apply this technique to estimate the total ber of images in the following way. First, we assume

every is equally likely. We can then image

that

pute the probability that a certain number of collisions were encountered, given the total number of different im- ages NV, the number of generated n, and the ber of collisions m. Au upper bound for the

But < sem since the user study will reveal for each sample s;

ity Bs:

(1 <n) whether it is new or a collision, we can compute the precise probability:

Since only n and m are known from the user study, we can compute N through a maximum-likelihood estima- tion: which value of N maximizes the probability? It is generally known as a good rule of that squaring the number of samples after the first collision, is a good estimate for NV.

Notice that Random Art is only a prototypical solu- tion, and hence, might not be the final answer for hash visualization.

## Conclusion and Future Work

Current security schemes fail to be secure in the real world, because they do not account for human factors.

structs can “destroy” randomness: As an example we We show how human limitations degrade the security:

consider a construct such as If x < 0.999 then A else B. Since « € [0,1], the condition is always true if the iw-

pixels, hence the subtree

in the else case is never evaluated. Ln addition, the hash visualization properties take the human factor into ac- count and therefore two images I; and I collide if they are near (I; ~ Is). Due to these issues, we could not for- mally prove that the images generated by Random Art satisfy the hash visualization requirements.

Instead, we propose to perform experiments to empir- ically estimate the difficulty to generate an image col- lision. With the assumption that all images produced by Random Art are equally likely*, our approach is to pick random seeds and count how many perceptually dif-

ferent can be generated. Lo perform the actual

images

counting, we make use of a statistical estimation method, based on the birthday paradox. The birthday paradox basically expresses that if we draw random samples out

of a uniform distribution with N distinct values, we start

is than 1000x1000

age

the difficulty of people to compare or memorize mean- ingless strings or numbers.

By analyzing two real-world security problems, we show that we could improve their security by taking hu- man factors into account in the system design. We pro- pose to overcome human limitations by replacing strings by structured images.

‘The two security we analyze are the validation of root keys, and user authentication. The current system to verify the validity of a root key is that users compare the fingerprint of the root key on their computer, with a reference fingerprint distributed over another channel, for example printed in the New York Times. Since this comparison many problems, we propose to trans- bears form key into an image. In this setting, a user the root needs compare images to verify the validity; one in to two

the

and the other

on the computer monitor.

newspaper

In user authentication, people have problems memoriz- ing numbers or passwords. Therefore we propose to re- place authentication through string memorization by au- thentication through image recognition, with the assump- tion that image recoguition is easier than exact string

recall. Our authentication procedure works in the fol- lowing way. Every user knows a small number of images,

the portfolio. lu the authentication process, the

image

user is presented with a number of images, and he or she marks the ones that are from the portfolio. scheme has additional advantages over other authentica- tion schemes: due to the structure of the images, they can hardly be written down or “explained” to another person.

Since the results presented in this paper are our early findings, there is a lot of work to be done to deploy these methods in reality. First, we need to strengthen the Ran- dom Art algorithm for this application, in the directions we have pointed out. We then need to evaluate in a user study, how many perceptually different images can be generated. We also need to analyze how people react to the and to verify how easy they are to remem- images, ber for different people. Other directions we are thinking

about is to generate a

image, such as a land-

scape or a city view. The rationale is to bring meaning to the which might help with long-term image,

## 7 Acknowledgments

‘We thank Andrej Bauer for developing the Random Art system, and Michael Witbrock and John Mount for the original idea of computer generated art. We are espe- cially grateful to Andrej Bauer for helping us to write section 3. Further we would like to thank everybody who has encouraged us to publish this work, in particu- lar Doug

## References

- [1] Private discussion with Stuart Card, March 1999.

- [2] John R. Anderson and Christian Lebiere. The Atomic Components of Thought. Lawrence Erlbaum Associates, Inc., 1998

- = Ross J. Anderson. Why munications of the ACM, 37(11):32-40, November 1994. Fail. Com-

- Andrej Bauer. Gallery of random art. WWW at fart /, 1998.

- L. Blum, M. Blum, and M. Shub. A Simple Unpre- dictable Pseudo-Random Number Generator. SIAM Journal on Computing, 15(2):364-383, 1986.

- Kenneth R. Boff, Lloyd Kaufman, and James P. “Thomas. Handbook of Perception and Human Per- formance. John Wiley and Sons, 1986.

- [7] R. M. Boynton and D. E. Boss. The effect of back- ground performance. Hluminating Engincering, 66:173-186, 1971. and contrast upon visual search

- [8] Stuart K. Card, Thomas P. Moran, and Allen Newell. The model human processor. In Kenneth R. Boff, Lloyd Kaufman, and James P. Thomas, ed- mance, chapter 45. John Wiley and Sons, 1986. Handbook of Perception and Human Perfor-

- [9] Simson Garfinkel and Gene Spafford. Practical Unix and Internet Security. O'Reilly and Associates, 1996.

- 10] Alfred J. Menezes, Paul van Oorschot, and Scott Vanstone. Handbook of Applied Cryptography. CRC: Press, 1997

- [ 11] G. A. Miller. The magical number seven, plus or mi- wus Some limits on our capacity for processing Psychological Review, 63:81-97, 1956.

- 12] Peter G. Neumann. Computer Related Risks. The ACM Addison press, Wesley. 1995.

- [ 13] R. E. Reynolds, R. M. White Jr., and R. L. Hilgen- dorf. Detection and recoguition of colored signal lights. Human Factors, 14:227-236, 1972.

- [ 14] Compaq SRC. Pachyderm. WWW at http://www 1998. /pachyderm

- 15] L. G. Williams. The effect of target specification on objects fixated during visual search. Perception and Psychophysics, 1:315-318, 1966.
