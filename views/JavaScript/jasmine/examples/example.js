//it(string, function)   一个测试Spec
//describe (string, function)    一个测试组开始于全局函数describe，一个describe是一个it的集合。describe包含n个it，一个it包含n个判断断言  Suite
describe("测试add()函数", function() {
  var add = function(a, b) {
    return a + b;
  };
  it("1 + 1 = 2", function() {
    expect(add(1, 1)).toBe(2);
  });
});

//matchFunction 的用法
describe("测试expect(a).matchFunction(b)中的matchFunction函数", function() {
//toBe   相当于===，处理简单字面值和变量
  it("toBe相当于===", function() {
    var a = 12;
    var b = a;

    expect(a).toBe(b);
    expect(a).not.toBe(null);
    expect(false == 0).toBe(true);
  });
  it("toBe不能当==用", function() {
    expect(false).toBe(0);
  });

//toEqual   处理简单字面值和变量，而且可以处理对象，数组
  it("toEqual可以处理字面值，变量和对象", function() {
    var a = 12;
    expect(a).toEqual(12);

    var foo = {key: "key"};
    var bar = {key: "key"};
    expect(foo).toEqual(bar);

    var arr1 = [];
    arr1["p1"] = "string1";
    var arr2 = [];
    arr2["p1"] = "string1";
    var obj = {};
    obj["p1"] = "string1";
    expect(arr1).toEqual(arr2);
    expect(arr1).toEqual(obj);
  });

//toMatch   按正则式检索。
  it("toMatch匹配正则式", function() {
    var message = "foo bar baz";
    expect(message).toMatch(/bar/);
    expect(message).toMatch("bar");
    expect(message).not.toMatch(/quux/);
    expect(message).toMatch(/^f/);
    expect(message).not.toMatch(/f$/);
  });

//toBeDefined   是否已声明且赋值
  it("toBeDefined检测变量非undefined", function() {
    var a = {key: "key"};

    expect(a.key).toBeDefined();
    expect(a.foo).not.toBeDefined();

    //expect(c).not.toBeDefined();  //未声明出错
    var b;
    expect(b).not.toBeDefined();
  });

//toContain   数组中是否包含元素（值）。只能用于数组，不能用于对象
  it("toContain检验数组中是否包含元素(值)", function() {
    var a = ["foo", "bar", "baz"];

    expect(a).toContain("bar");
  });

//toBeCloseTo   数值比较时定义精度，先四舍五入后再比较
  it("toBeCloseTo数值比较，指定精度，先四舍五入再比较", function() {
    var pi = 3.1415926, e = 2.78;

    expect(pi).toBeCloseTo(e, 0);
    expect(pi).not.toBeCloseTo(e, 0.1);
  });


//toThrow    检验一个函数是否会抛出一个错误
  it("toThrow检验一个函数是否会抛出一个错误", function() {
    var foo = function() {
      return 1 + 2;
    };
    var bar = function() {
      return a + 1;
    };

    expect(foo).not.toThrow();
    expect(bar).toThrow();
  });
});

//Spy   存储函数的被调用情况和参数（函数监视器，记录被调用情况，但函数并不真执行）
describe("对spy函数的测试", function() {
  var foo, bar = null;

  beforeEach(function() {
    foo = {
      setBar: function(value) {
        bar = value;
      }
    };

    spyOn(foo, 'setBar');  //foo为spy函数

    foo.setBar(123);
    foo.setBar(456, 'another param');
  });

  it("测试foo函数是否被调用过", function() {
    expect(foo.setBar).toHaveBeenCalled();
  });

  it("测试foo函数被调用的次数", function() {
    expect(foo.setBar.calls.length).toEqual(2);
  });

  it("测试foo函数被调用时传入的参数", function() {
    expect(foo.setBar).toHaveBeenCalledWith(123);
    expect(foo.setBar).toHaveBeenCalledWith(456, 'another param');
  });

  it("上一次被调用的参数", function() {
    expect(foo.setBar.mostRecentCall.args[0]).toEqual(456);
  });

  it("所有被调用的情况存在一个数组里", function() {
    expect(foo.setBar.calls[0].args[0]).toEqual(123);
  });

  it("函数并未真的执行", function() {
    expect(bar).toBeNull();
  });
});

//Spy addCallThrough  函数监视器，但函数真的执行
describe("对spy函数的测试，函数真的执行", function() {
  var foo, bar, fetchedBar;

  beforeEach(function() {
    foo = {
      setBar: function(value) {
        bar = value;
      },
      getBar: function() {
        return bar;
      }
    };

    //spyOn(foo, "setBar");    //如果加上这句，setBar不真的执行，后两个spec不通过
    spyOn(foo, 'getBar').andCallThrough();

    foo.setBar(123);
    fetchedBar = foo.getBar();
  });

  it("测试foo中getBar函数是否被调用过", function() {
    expect(foo.getBar).toHaveBeenCalled();
  });

  it("foo中setBar函数真的执行了", function() {
    expect(bar).toEqual(123);
  });

  it("foo中getBar函数真的执行了", function() {
    expect(fetchedBar).toEqual(123);
  });
});


//Spy andReturn  函数监视器，函数不真的执行。指定监视的函数的返回值
describe("A spy, when faking a return value", function() {
  var foo, bar, fetchedBar;

  beforeEach(function() {
    foo = {
      setBar: function(value) {
        bar = value;
      },
      getBar: function() {
        return bar;
      }
    };

    spyOn(foo, 'getBar').andReturn(745);  //指定getBar函数返回745

    foo.setBar(123);
    fetchedBar = foo.getBar();
  });

  it("测试foo中getBar函数是否被调用过", function() {
    expect(foo.getBar).toHaveBeenCalled();
  });

  it("不影响未被监视的其它函数", function() {
    expect(bar).toEqual(123);
  });

  it("指定的返回值745", function() {
    expect(fetchedBar).toEqual(745);
  });
});


//Spy addCallFake  替代被监视的函数，原函数不执行
describe("替代被监视的函数，原函数不执行", function() {
  var foo, bar, fetchedBar;

  beforeEach(function() {
    foo = {
      setBar: function(value) {
        bar = value;
      },
      getBar: function() {
        alert("frostbelt");
        return bar;
      }
    };

    spyOn(foo, 'getBar').andCallFake(function() {
      return 1001;
    });

    foo.setBar(123);
    fetchedBar = foo.getBar();
  });

  it("测试foo中getBar函数是否被调用过", function() {
    expect(foo.getBar).toHaveBeenCalled();
  });

  it("不影响未被监视的其它函数", function() {
    expect(bar).toEqual(123);
  });

  it("getBar被addCallFake指定的匿名函数代替，getBar不执行", function() {
    expect(fetchedBar).toEqual(1001);
  });
});


//如果你没有什么可监视的又实在想监视一下，该咋办？自己create一个被监视函数。。
//jasmine.createSpy(functionId)
describe("自己造一个被监视函数。啊，我凌乱了。。", function() {
  var whatAmI;

  beforeEach(function() {
    whatAmI = jasmine.createSpy('whatAmI');

    whatAmI("I", "am", "a", "spy");
  });

  it("有个id，是createSpy的传入函数，用于报错", function() {
    expect(whatAmI.identity).toEqual('whatAmI');
  });

  it("是否被调用", function() {
    expect(whatAmI).toHaveBeenCalled();
  });

  it("被调用的次数", function() {
    expect(whatAmI.calls.length).toEqual(1);
  });

  it("被调用的参数", function() {
    expect(whatAmI).toHaveBeenCalledWith("I", "am", "a", "spy");
  });

  it("最近一次被调用", function() {
    expect(whatAmI.mostRecentCall.args[0]).toEqual("I");
  });
});


//有时需要监视一个对象的很多方法，用createSpyObj添加方法数组
//jasmine.createSpyObj(obj, methodArray)
describe("有时需要监视一个对象的很多个方法，用createSpyObj添加数组", function() {
  var tape;

  beforeEach(function() {
    tape = jasmine.createSpyObj('tape', ['play', 'pause', 'stop', 'rewind']);

    tape.play();
    tape.pause();
    tape.rewind(0);
  });

  it("tape对象的这四个方法已被定义", function() {
    expect(tape.play).toBeDefined();
    expect(tape.pause).toBeDefined();
    expect(tape.stop).toBeDefined();
    expect(tape.rewind).toBeDefined();
  });

  it("四个方法是否被调用", function() {
    expect(tape.play).toHaveBeenCalled();
    expect(tape.pause).toHaveBeenCalled();
    expect(tape.rewind).toHaveBeenCalled();
    expect(tape.stop).not.toHaveBeenCalled();
  });

  it("被调用时传入的参数", function() {
    expect(tape.rewind).toHaveBeenCalledWith(0);
  });
});


//jasmine.any   类型判断。instanceof
describe("类型匹配", function() {
  it("相当于instanceof", function() {
    expect({}).toEqual(jasmine.any(Object));
    expect(12).toEqual(jasmine.any(Number));
  });

  it("也可以用于spy", function() {
    var foo = jasmine.createSpy('foo');
    foo(12, function() {
      return true;
    });

    expect(foo).toHaveBeenCalledWith(jasmine.any(Number), jasmine.any(Function));
    //foo被调用时的参数 类型判断
  });
});

//jasmine.Clock.useMock()   jasmine自己控制时间，实现异步调试，减少等待
//jasmine.Clock.tick(n:uint)   向前n毫秒
describe("jasmine自己控制时间，实现异步调试，减少等待", function() {
  var timerCallback;

  beforeEach(function() {
    timerCallback = jasmine.createSpy('timerCallback');
    jasmine.Clock.useMock();
  });

  it("setTimeout", function() {
    setTimeout(function() {
      timerCallback();
    }, 100);

    expect(timerCallback).not.toHaveBeenCalled();

    jasmine.Clock.tick(101);

    expect(timerCallback).toHaveBeenCalled();
  });

  it("setInterval", function() {
    setInterval(function() {
      timerCallback();
    }, 100);

    expect(timerCallback).not.toHaveBeenCalled();

    jasmine.Clock.tick(101);
    expect(timerCallback.callCount).toEqual(1);

    jasmine.Clock.tick(50);
    expect(timerCallback.callCount).toEqual(1);

    jasmine.Clock.tick(50);
    expect(timerCallback.callCount).toEqual(2);
  });
});

//runs(function)  waitsFor(function, message, millisec)   Jasmine异步调试  按自己的理解写个例子
describe("jasmine异步调试，对ajax结果的断言", function() {
  var data, flag = false;

  it("ajax是否按时返回了正确结果", function() {
    runs(function() {
      $.post(
              url,
              {},
              function(data) {
                flag = true;
                data = data.someAttr;
              }
      );
    });

    waitsFor(function() {  //flag为true或到2秒时执行  2秒内返回true则执行最后一个runs，到时未返回则本spec出错，返回第二个参数错误信息
      return flag;
    }, "ajax在指定时间2秒内未返回", 2000);

    runs(function() {  //直到waitsFor返回true时执行
      expect(data).toEqual("someThing");
    });
  });
});