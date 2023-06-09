import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto/user-edit.dto';

describe('first app e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const appModuleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = appModuleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3334);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3334');
  });

  afterAll(async () => {
    app.close();
  });

  describe('auth', () => {
    describe('signup', () => {
      it('should signup a user', async () => {
        const body: AuthDto = {
          email: 'test@test.com',
          password: 'password',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(body)
          .expectStatus(HttpStatus.CREATED)
          .expectJsonLike({ access_token: /.+/ });
      });
      it('should throw error without email', async () => {
        const body: AuthDto = {
          email: '',
          password: 'password',
        };
        return pactum.spec().post('/auth/signup').withBody(body).expectStatus(400);
      });
      it('should throw error without password', async () => {
        const body = {
          email: 'test@test.com',
          password: '',
        } satisfies AuthDto;
        return pactum.spec().post('/auth/signup').withBody(body).expectStatus(400);
      });
    });
    describe('signin', () => {
      it('should signip a user', async () => {
        const body = {
          email: 'test@test.com',
          password: 'password',
        } satisfies AuthDto;
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(body)
          .expectStatus(HttpStatus.OK)
          .expectJsonLike({ access_token: /.+/ })
          .stores('token', 'access_token');
      });
    });
  });

  describe('user', () => {
    describe('me', () => {
      it('should get me', async () => {
        return pactum.spec().get('/users/me').withBearerToken('$S{token}').expectStatus(200);
      });
    });
    describe('edit', () => {
      it('should edit user username', async () => {
        const body = {
          username: 'testPactum',
        } satisfies EditUserDto;
        return pactum
          .spec()
          .patch('/users/me')
          .withBody(body)
          .withBearerToken('$S{token}')
          .expectBodyContains(body.username);
      });
      it('should edit user email and username', async () => {
        const body = {
          username: 'testPactum',
          email: 'test2@test2.test',
        } satisfies EditUserDto;
        return pactum
          .spec()
          .patch('/users/me')
          .withBody(body)
          .withBearerToken('$S{token}')
          .expectBodyContains(body.username)
          .expectBodyContains(body.email)
          .expectStatus(HttpStatus.OK);
      });
      it('should throw body validation error', async () => {
        const body = {
          nickname: 2,
          email: 'test2@test2',
        };
        return pactum.spec().patch('/users/me').withBody(body).withBearerToken('$S{token}').expectStatus(400);
      });
      it('should throw auth error', async () => {
        const body = {
          nickname: '',
          email: 'test2@test2.pl',
        };
        return pactum.spec().patch('/users/me').withBody(body).expectStatus(401);
      });
    });
  });

  describe('waterintake', () => {
    describe('save waterintake', () => {
      it('should save waterintake', async () => {
        const body = {
          amount: 100,
        };
        return pactum
          .spec()
          .post('/waterintakes')
          .withBody(body)
          .withBearerToken('$S{token}')
          .expectStatus(HttpStatus.CREATED);
      });
      it('should throw decimal number', async () => {
        const body = {
          amount: 10.1,
        };
        return pactum
          .spec()
          .post('/waterintakes')
          .withBody(body)
          .withBearerToken('$S{token}')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw on negative number', async () => {
        const body = {
          amount: -10,
        };
        return pactum
          .spec()
          .post('/waterintakes')
          .withBody(body)
          .withBearerToken('$S{token}')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });
  });
  describe('Show all waterintakes', () => {
    it('should show all waterintakes of currently logged in user', async () => {
      const body = {
        amount: 200,
      };
      pactum
        .spec()
        .post('/waterintakes')
        .withBody(body)
        .withBearerToken('$S{token}')
        .expectStatus(HttpStatus.CREATED)
        .toss();
      return pactum
        .spec()
        .get('/waterintakes')
        .withBearerToken('$S{token}')
        .expectStatus(HttpStatus.OK)
        .stores('waterintake', '[0].id')
        .inspect();
    });
  });

  describe('Delete waterintakes', () => {
    it('should delete waterintake for current user', () => {
      return pactum
        .spec()
        .delete('/waterintakes/$S{waterintake}')
        .withBearerToken('$S{token}')
        .expectStatus(HttpStatus.NO_CONTENT);
    });
  });
});
